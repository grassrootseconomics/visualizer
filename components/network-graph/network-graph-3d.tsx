import { Links, Nodes } from "@utils/render_graph";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useRef } from "react";
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

// Custom comparison to prevent unnecessary re-renders
const arePropsEqual = (
  prevProps: GraphComponentProps,
  nextProps: GraphComponentProps
): boolean => {
  // Compare data lengths (cheap check for data changes)
  if (
    prevProps.graphData.nodes.length !== nextProps.graphData.nodes.length ||
    prevProps.graphData.links.length !== nextProps.graphData.links.length
  ) {
    return false;
  }
  // Compare physics values
  if (
    prevProps.chargeStrength !== nextProps.chargeStrength ||
    prevProps.linkDistance !== nextProps.linkDistance ||
    prevProps.centerGravity !== nextProps.centerGravity
  ) {
    return false;
  }
  // Compare animate flag
  if (prevProps.animate !== nextProps.animate) {
    return false;
  }
  return true;
};

// Brighter pulse colors
const PULSE_COLOR_CORE = new THREE.Color(0xffffff); // Pure white core
const PULSE_COLOR_MID = new THREE.Color(0xffee66); // Bright yellow
const PARTICLE_COLOR = new THREE.Color(0xffff99); // Bright yellow particle

// Shared geometry pool - created once, reused everywhere
// Using unit size geometries (radius=1) that get scaled at runtime
const SHARED_GEOMETRIES = {
  sphere: new THREE.SphereGeometry(1, 10, 10), // Reduced segments for performance
  sphereLow: new THREE.SphereGeometry(1, 6, 6), // Lower detail for particles/trails
  torus: new THREE.TorusGeometry(1, 0.08, 6, 20), // Unit torus for rings
};

// Store for dynamic objects that need updating
interface PulseObjects {
  particles: Map<string, THREE.Group>;
  nodeGlows: Map<string, THREE.Group>;
}

// Helper to dispose materials only (geometries are shared/pooled)
function disposeGroupMaterialsOnly(group: THREE.Group) {
  while (group.children.length > 0) {
    const child = group.children[0];
    group.remove(child);
    if (child instanceof THREE.Mesh) {
      // Only dispose material, NOT geometry (it's shared)
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  }
}

// Helper to create a mesh using shared/pooled geometry
function createPooledSphereMesh(
  scale: number,
  color: THREE.Color,
  opacity: number,
  lowDetail: boolean = false
): THREE.Mesh {
  const mesh = new THREE.Mesh(
    lowDetail ? SHARED_GEOMETRIES.sphereLow : SHARED_GEOMETRIES.sphere,
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity })
  );
  mesh.scale.setScalar(scale);
  return mesh;
}

// Helper to create a torus mesh using shared geometry
function createPooledTorusMesh(
  radius: number,
  color: THREE.Color,
  opacity: number
): THREE.Mesh {
  const mesh = new THREE.Mesh(
    SHARED_GEOMETRIES.torus,
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
    })
  );
  mesh.scale.setScalar(radius);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

export const NetworkGraph3d = React.memo(function NetworkGraph3d({
  graphData: inputData,
  chargeStrength = DEFAULT_PHYSICS.chargeStrength,
  linkDistance = DEFAULT_PHYSICS.linkDistance,
  centerGravity = DEFAULT_PHYSICS.centerGravity,
  animate = true,
}: GraphComponentProps) {
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

        // Clear old children (only dispose materials, geometries are shared)
        disposeGroupMaterialsOnly(glowGroup);

        // Inner bright glow - using pooled geometry with scale
        const innerGlow = createPooledSphereMesh(
          6 + intensity * 4,
          PULSE_COLOR_CORE,
          intensity * 0.7
        );
        glowGroup.add(innerGlow);

        // Outer glow - using pooled geometry with scale
        const outerGlow = createPooledSphereMesh(
          10 + intensity * 8,
          PULSE_COLOR_MID,
          intensity * 0.4
        );
        glowGroup.add(outerGlow);

        // Expanding rings - using pooled torus geometry
        const waveProgress = elapsed / PULSE_DURATION;
        for (let i = 0; i < 3; i++) {
          const ringProgress = (waveProgress + i * 0.25) % 1;
          const ringRadius = 8 + ringProgress * 30;
          const ringOpacity = Math.pow(1 - ringProgress, 1.5) * intensity * 0.5;

          if (ringOpacity > 0.02) {
            const ring = createPooledTorusMesh(
              ringRadius,
              PULSE_COLOR_MID,
              ringOpacity
            );
            glowGroup.add(ring);
          }
        }
      });

      // Remove expired node glows
      for (const nodeId of expiredNodeGlows) {
        const glow = pulseObjects.nodeGlows.get(nodeId);
        if (glow) {
          disposeGroupMaterialsOnly(glow);
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

        // Clear old particles (only dispose materials, geometries are shared)
        disposeGroupMaterialsOnly(particleGroup);

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

            // Main particle - using pooled geometry
            const particle = createPooledSphereMesh(size, PARTICLE_COLOR, opacity, true);
            particle.position.set(x, y, z);
            particleGroup.add(particle);

            // Particle glow - using pooled geometry
            const glow = createPooledSphereMesh(size * 2.5, PULSE_COLOR_CORE, opacity * 0.5, true);
            glow.position.set(x, y, z);
            particleGroup.add(glow);

            // Trail - using pooled geometry
            for (let t = 1; t <= 4; t++) {
              const trailProgress = progress - t * 0.025;
              if (trailProgress > 0) {
                const trailX = sx + (tx - sx) * trailProgress;
                const trailY = sy + (ty - sy) * trailProgress;
                const trailZ = sz + (tz - sz) * trailProgress;

                const trailSize = size * (1 - t * 0.2);
                const trailOpacity = opacity * (1 - t * 0.25);

                const trail = createPooledSphereMesh(trailSize, PULSE_COLOR_MID, trailOpacity, true);
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
          disposeGroupMaterialsOnly(particles);
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
          disposeGroupMaterialsOnly(glow);
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
          disposeGroupMaterialsOnly(particles);
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
      // Cleanup all objects with proper disposal (only materials, geometries are pooled)
      const scene = sceneRef.current;
      const pulseObjects = pulseObjectsRef.current;

      pulseObjects.nodeGlows.forEach((glow) => {
        disposeGroupMaterialsOnly(glow);
        if (scene) scene.remove(glow);
      });
      pulseObjects.particles.forEach((particles) => {
        disposeGroupMaterialsOnly(particles);
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

  // Link width based on transaction count (aggregated) + pulse effect
  const getLinkWidth = useCallback(
    (link: any) => {
      const linkKey = getLinkKey(link);
      const pulseTime = pulsingLinks.current.get(linkKey);
      const pulseIntensity = getPulseIntensity(pulseTime);
      // Base width scales with txCount (aggregated links are thicker)
      // Use log scale to prevent extremely thick links
      const txCount = link.txCount || 1;
      const baseWidth = 0.5 + Math.log10(txCount + 1) * 1.5;
      return baseWidth + pulseIntensity * 4;
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
        createLinkLabel(link.token_symbol, link.token_name, link.txCount)
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
}, arePropsEqual);
