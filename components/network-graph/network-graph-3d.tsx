import { Links, Nodes } from "@utils/render_graph";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  createLinkLabel,
  createNodeLabel,
  DEFAULT_PHYSICS,
  getLinkKey,
  GRAPH_CONFIG,
  GraphComponentProps,
  PULSE_DURATION,
  useGraphData,
  useGraphForces,
} from "./use-graph-data";

const ForceGraph3d = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

// Brighter pulse colors
const PULSE_COLOR_CORE = new THREE.Color(0xffffff); // Pure white core
const PULSE_COLOR_MID = new THREE.Color(0xffee66); // Bright yellow
const PARTICLE_COLOR = new THREE.Color(0xffff99); // Bright yellow particle

// Store for dynamic objects that need updating
interface PulseObjects {
  particles: Map<string, THREE.Group>;
  nodeGlows: Map<string, THREE.Group>;
}

// Helper to dispose of a THREE.Group and all its children
function disposeGroup(group: THREE.Group) {
  while (group.children.length > 0) {
    const child = group.children[0];
    group.remove(child);
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  }
}

export const NetworkGraph3d = ({
  graphData: inputData,
  chargeStrength = DEFAULT_PHYSICS.chargeStrength,
  linkDistance = DEFAULT_PHYSICS.linkDistance,
  centerGravity = DEFAULT_PHYSICS.centerGravity,
  animate = true,
}: GraphComponentProps) => {
  const graphRef = useRef<any>();
  const pulseObjectsRef = useRef<PulseObjects>({
    particles: new Map(),
    nodeGlows: new Map(),
  });
  const sceneRef = useRef<THREE.Scene | null>(null);

  const {
    displayedData,
    pulsingNodes,
    pulsingLinks,
    getPulseIntensity,
    cleanupPulses,
  } = useGraphData({
    inputData,
    is3D: true,
    minLinkCount: 1,
    animate,
  });

  const { configureForces } = useGraphForces(
    graphRef,
    chargeStrength,
    linkDistance,
    centerGravity
  );

  // Store displayedData in a ref so animation loop can access latest without re-running effect
  const displayedDataRef = useRef(displayedData);
  useEffect(() => {
    displayedDataRef.current = displayedData;
  }, [displayedData]);

  // Animation loop for pulse effects - only runs once on mount
  useEffect(() => {
    let animationId: number;
    let isRunning = true;

    const animate = () => {
      if (!isRunning) return;

      // Try to get scene from the graph ref each frame until we have it
      const fg = graphRef.current;
      let scene = sceneRef.current;

      if (!scene && fg) {
        try {
          scene = fg.scene?.();
          if (scene) {
            sceneRef.current = scene;
          }
        } catch {
          // scene() not ready yet
        }
      }

      if (!scene) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      const pulseObjects = pulseObjectsRef.current;
      const currentDisplayedData = displayedDataRef.current;
      const now = Date.now();

      // Collect expired node glows to remove after iteration
      const expiredNodeGlows: string[] = [];

      // Update node glow effects
      pulsingNodes.current.forEach((pulseTime, nodeId) => {
        const elapsed = now - pulseTime;
        if (elapsed > PULSE_DURATION) {
          expiredNodeGlows.push(nodeId);
          return;
        }

        const intensity = getPulseIntensity(pulseTime);
        const node = currentDisplayedData.nodes.find((n) => n.id === nodeId);
        if (!node || node.x === undefined) return;

        let glowGroup = pulseObjects.nodeGlows.get(nodeId);

        if (!glowGroup) {
          glowGroup = new THREE.Group();
          pulseObjects.nodeGlows.set(nodeId, glowGroup);
          scene.add(glowGroup);
        }

        // Update position
        glowGroup.position.set(node.x, node.y, node.z || 0);

        // Clear old children and recreate
        disposeGroup(glowGroup);

        // Inner bright glow
        const innerGlowGeom = new THREE.SphereGeometry(6 + intensity * 4, 16, 16);
        const innerGlowMat = new THREE.MeshBasicMaterial({
          color: PULSE_COLOR_CORE,
          transparent: true,
          opacity: intensity * 0.7,
        });
        const innerGlow = new THREE.Mesh(innerGlowGeom, innerGlowMat);
        glowGroup.add(innerGlow);

        // Outer glow
        const outerGlowGeom = new THREE.SphereGeometry(10 + intensity * 8, 16, 16);
        const outerGlowMat = new THREE.MeshBasicMaterial({
          color: PULSE_COLOR_MID,
          transparent: true,
          opacity: intensity * 0.4,
        });
        const outerGlow = new THREE.Mesh(outerGlowGeom, outerGlowMat);
        glowGroup.add(outerGlow);

        // Expanding rings
        const waveProgress = elapsed / PULSE_DURATION;
        for (let i = 0; i < 3; i++) {
          const ringProgress = (waveProgress + i * 0.25) % 1;
          const ringRadius = 8 + ringProgress * 30;
          const ringOpacity = Math.pow(1 - ringProgress, 1.5) * intensity * 0.5;

          if (ringOpacity > 0.02) {
            const ringGeom = new THREE.TorusGeometry(ringRadius, 0.8, 8, 32);
            const ringMat = new THREE.MeshBasicMaterial({
              color: PULSE_COLOR_MID,
              transparent: true,
              opacity: ringOpacity,
              side: THREE.DoubleSide,
            });
            const ring = new THREE.Mesh(ringGeom, ringMat);
            ring.rotation.x = Math.PI / 2;
            glowGroup.add(ring);
          }
        }
      });

      // Remove expired node glows
      for (const nodeId of expiredNodeGlows) {
        const glow = pulseObjects.nodeGlows.get(nodeId);
        if (glow) {
          disposeGroup(glow);
          scene.remove(glow);
          pulseObjects.nodeGlows.delete(nodeId);
        }
      }

      // Collect expired link particles to remove after iteration
      const expiredLinkParticles: string[] = [];

      // Update link particle effects
      pulsingLinks.current.forEach((pulseTime, linkKey) => {
        const elapsed = now - pulseTime;
        if (elapsed > PULSE_DURATION) {
          expiredLinkParticles.push(linkKey);
          return;
        }

        const intensity = getPulseIntensity(pulseTime);

        // Find the link
        const link = currentDisplayedData.links.find((l) => {
          const src = typeof l.source === "object" ? (l.source as any).id : l.source;
          const tgt = typeof l.target === "object" ? (l.target as any).id : l.target;
          return `${src}|${tgt}|${l.date}` === linkKey;
        });

        if (!link) return;

        const source = typeof link.source === "object" ? link.source : null;
        const target = typeof link.target === "object" ? link.target : null;

        if (!source || !target || (source as any).x === undefined) return;

        let particleGroup = pulseObjects.particles.get(linkKey);

        if (!particleGroup) {
          particleGroup = new THREE.Group();
          pulseObjects.particles.set(linkKey, particleGroup);
          scene.add(particleGroup);
        }

        // Clear old particles
        disposeGroup(particleGroup);

        const sx = (source as any).x, sy = (source as any).y, sz = (source as any).z || 0;
        const tx = (target as any).x, ty = (target as any).y, tz = (target as any).z || 0;

        // Create particles traveling from source to target
        const particleProgress = Math.min(elapsed / (PULSE_DURATION * 0.6), 1);

        for (let i = 0; i < 5; i++) {
          const offset = i * 0.12;
          const progress = Math.max(0, Math.min(1, particleProgress * 1.4 - offset));

          if (progress > 0 && progress < 1) {
            const x = sx + (tx - sx) * progress;
            const y = sy + (ty - sy) * progress;
            const z = sz + (tz - sz) * progress;

            const sizeCurve = Math.sin(progress * Math.PI);
            const size = 2 + sizeCurve * 3;
            const opacity = sizeCurve * 0.9 * intensity;

            // Main particle
            const particleGeom = new THREE.SphereGeometry(size, 8, 8);
            const particleMat = new THREE.MeshBasicMaterial({
              color: PARTICLE_COLOR,
              transparent: true,
              opacity: opacity,
            });
            const particle = new THREE.Mesh(particleGeom, particleMat);
            particle.position.set(x, y, z);
            particleGroup.add(particle);

            // Particle glow
            const glowGeom = new THREE.SphereGeometry(size * 2.5, 8, 8);
            const glowMat = new THREE.MeshBasicMaterial({
              color: PULSE_COLOR_CORE,
              transparent: true,
              opacity: opacity * 0.5,
            });
            const glow = new THREE.Mesh(glowGeom, glowMat);
            glow.position.set(x, y, z);
            particleGroup.add(glow);

            // Trail
            for (let t = 1; t <= 4; t++) {
              const trailProgress = progress - t * 0.025;
              if (trailProgress > 0) {
                const trailX = sx + (tx - sx) * trailProgress;
                const trailY = sy + (ty - sy) * trailProgress;
                const trailZ = sz + (tz - sz) * trailProgress;

                const trailSize = size * (1 - t * 0.2);
                const trailOpacity = opacity * (1 - t * 0.25);

                const trailGeom = new THREE.SphereGeometry(trailSize, 6, 6);
                const trailMat = new THREE.MeshBasicMaterial({
                  color: PULSE_COLOR_MID,
                  transparent: true,
                  opacity: trailOpacity,
                });
                const trail = new THREE.Mesh(trailGeom, trailMat);
                trail.position.set(trailX, trailY, trailZ);
                particleGroup.add(trail);
              }
            }
          }
        }
      });

      // Remove expired link particles
      for (const linkKey of expiredLinkParticles) {
        const particles = pulseObjects.particles.get(linkKey);
        if (particles) {
          disposeGroup(particles);
          scene.remove(particles);
          pulseObjects.particles.delete(linkKey);
        }
      }

      // Clean up objects that are no longer in pulsingNodes/pulsingLinks
      const nodeGlowsToRemove: string[] = [];
      pulseObjects.nodeGlows.forEach((_, nodeId) => {
        if (!pulsingNodes.current.has(nodeId)) {
          nodeGlowsToRemove.push(nodeId);
        }
      });
      for (const nodeId of nodeGlowsToRemove) {
        const glow = pulseObjects.nodeGlows.get(nodeId);
        if (glow) {
          disposeGroup(glow);
          scene.remove(glow);
          pulseObjects.nodeGlows.delete(nodeId);
        }
      }

      const particlesToRemove: string[] = [];
      pulseObjects.particles.forEach((_, linkKey) => {
        if (!pulsingLinks.current.has(linkKey)) {
          particlesToRemove.push(linkKey);
        }
      });
      for (const linkKey of particlesToRemove) {
        const particles = pulseObjects.particles.get(linkKey);
        if (particles) {
          disposeGroup(particles);
          scene.remove(particles);
          pulseObjects.particles.delete(linkKey);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationId);
      // Cleanup all objects with proper disposal
      const scene = sceneRef.current;
      const pulseObjects = pulseObjectsRef.current;

      pulseObjects.nodeGlows.forEach((glow) => {
        disposeGroup(glow);
        if (scene) scene.remove(glow);
      });
      pulseObjects.particles.forEach((particles) => {
        disposeGroup(particles);
        if (scene) scene.remove(particles);
      });

      pulseObjects.nodeGlows.clear();
      pulseObjects.particles.clear();
    };
  }, [pulsingNodes, pulsingLinks, getPulseIntensity]);

  const handleEngineTick = useCallback(() => {
    configureForces();
    cleanupPulses();
  }, [configureForces, cleanupPulses]);

  const handleNodeClick = useCallback((node: Nodes[0]) => {
    navigator.clipboard.writeText(node.id);
    window.open(`https://celoscan.io/address/${node.id}`, "_blank");
  }, []);

  const handleLinkClick = useCallback((link: Links[0]) => {
    navigator.clipboard.writeText(link.contract_address);
    window.open(
      `https://sarafu.network/vouchers/${link.contract_address}`,
      "_blank"
    );
  }, []);

  // Link color with pulse effect
  const getLinkColor = useCallback(
    (link: any) => {
      const linkKey = getLinkKey(link);
      const pulseTime = pulsingLinks.current.get(linkKey);
      const pulseIntensity = getPulseIntensity(pulseTime);

      if (pulseTime && Date.now() - pulseTime > PULSE_DURATION) {
        pulsingLinks.current.delete(linkKey);
      }

      if (pulseIntensity > 0) {
        const brightColor = PULSE_COLOR_CORE.clone().lerp(PULSE_COLOR_MID, 1 - pulseIntensity);
        const baseColor = new THREE.Color(link.color || 0x999999);
        const resultColor = baseColor.clone().lerp(brightColor, pulseIntensity * 0.9);
        return `#${resultColor.getHexString()}`;
      }

      return link.color || "#999999";
    },
    [getPulseIntensity, pulsingLinks]
  );

  // Link width with pulse effect
  const getLinkWidth = useCallback(
    (link: any) => {
      const linkKey = getLinkKey(link);
      const pulseTime = pulsingLinks.current.get(linkKey);
      const pulseIntensity = getPulseIntensity(pulseTime);
      return 1 + pulseIntensity * 6;
    },
    [getPulseIntensity, pulsingLinks]
  );

  return (
    <ForceGraph3d
      ref={graphRef}
      nodeId="id"
      enableNodeDrag={false}
      nodeLabel={(node: Nodes[0]) => createNodeLabel(node.id)}
      linkLabel={(link: Links[0]) =>
        createLinkLabel(link.token_symbol, link.token_name)
      }
      backgroundColor={GRAPH_CONFIG.backgroundColor}
      graphData={displayedData}
      onNodeClick={handleNodeClick}
      onLinkClick={handleLinkClick}
      onEngineTick={handleEngineTick}
      nodeAutoColorBy={(n: Nodes[0]) => Object.keys(n.usedVouchers)[0]}
      linkAutoColorBy="contract_address"
      linkColor={getLinkColor}
      linkWidth={getLinkWidth}
      linkOpacity={0.4}
      cooldownTime={Infinity}
      d3AlphaDecay={GRAPH_CONFIG.d3AlphaDecay}
      d3VelocityDecay={GRAPH_CONFIG.d3VelocityDecay}
    />
  );
};
