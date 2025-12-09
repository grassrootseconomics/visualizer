import { Link, Nodes } from "@utils/render_graph";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

export const NetworkGraph2d = React.memo(function NetworkGraph2d({
  graphData: inputData,
  chargeStrength = DEFAULT_PHYSICS.chargeStrength,
  linkDistance = DEFAULT_PHYSICS.linkDistance,
  centerGravity = DEFAULT_PHYSICS.centerGravity,
  animate = true,
}: GraphComponentProps) {
  const [ForceGraph2D, setForceGraph2D] = useState<any>(null);
  const graphRef = useRef<any>(null);

  useEffect(() => {
    import("react-force-graph-2d").then((mod) => {
      setForceGraph2D(() => mod.default);
    });
  }, []);

  const {
    displayedData,
    pulsingNodes,
    pulsingLinks,
    getPulseIntensity,
    cleanupPulses,
  } = useGraphData({
    inputData,
    is3D: false,
    minLinkCount: 2,
    animate,
  });

  const { configureForces } = useGraphForces(
    graphRef,
    chargeStrength,
    linkDistance,
    centerGravity
  );

  const handleEngineTick = useCallback(() => {
    configureForces();
    cleanupPulses();
  }, [configureForces, cleanupPulses]);

  const handleClick = useCallback((node: Nodes[0]) => {
    navigator.clipboard.writeText(node.id);
  }, []);

  const nodeCanvasObject = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, _globalScale: number) => {
      const pulseTime = pulsingNodes.current.get(node.id);
      const pulseIntensity = getPulseIntensity(pulseTime);

      if (pulseTime && Date.now() - pulseTime > PULSE_DURATION) {
        pulsingNodes.current.delete(node.id);
      }

      const baseRadius = 4;
      const x = node.x || 0;
      const y = node.y || 0;

      if (pulseIntensity > 0) {
        // Outer pulse ring
        ctx.beginPath();
        ctx.arc(x, y, baseRadius + pulseIntensity * 12, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(255, 200, 100, ${pulseIntensity * 0.4})`;
        ctx.fill();

        // Inner glow
        ctx.beginPath();
        ctx.arc(x, y, baseRadius + pulseIntensity * 6, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(255, 150, 50, ${pulseIntensity * 0.6})`;
        ctx.fill();
      }

      // Main node
      ctx.beginPath();
      ctx.arc(x, y, baseRadius, 0, 2 * Math.PI);
      ctx.fillStyle = node.color || "#666";
      ctx.fill();
    },
    [getPulseIntensity, pulsingNodes]
  );

  const linkCanvasObject = useCallback(
    (link: any, ctx: CanvasRenderingContext2D, _globalScale: number) => {
      const linkKey = getLinkKey(link);
      const pulseTime = pulsingLinks.current.get(linkKey);
      const pulseIntensity = getPulseIntensity(pulseTime);

      if (pulseTime && Date.now() - pulseTime > PULSE_DURATION) {
        pulsingLinks.current.delete(linkKey);
      }

      const source =
        typeof link.source === "object" ? link.source : { x: 0, y: 0 };
      const target =
        typeof link.target === "object" ? link.target : { x: 0, y: 0 };

      if (!source.x || !target.x) return;

      if (pulseIntensity > 0) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = `rgba(255, 180, 80, ${pulseIntensity * 0.8})`;
        ctx.lineWidth = 0.5 + pulseIntensity * 4;
        ctx.stroke();
      }

      // Base width scales with txCount (aggregated links are thicker)
      const txCount = link.txCount || 1;
      const baseWidth = 0.3 + Math.log10(txCount + 1) * 0.8;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = link.color || "#999";
      ctx.lineWidth = baseWidth;
      ctx.stroke();
    },
    [getPulseIntensity, pulsingLinks]
  );

  if (!ForceGraph2D) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading graph...
      </div>
    );
  }

  return (
    <ForceGraph2D
      ref={graphRef}
      nodeId="id"
      enableNodeDrag={false}
      nodeLabel={(d: Nodes[0]) => createNodeLabel(d.id)}
      linkLabel={(d: Link) => createLinkLabel(d?.token_symbol, d?.token_name, d?.txCount)}
      nodeAutoColorBy={(n: Nodes[0]) => Object.keys(n.usedVouchers)[0]}
      backgroundColor={GRAPH_CONFIG.backgroundColor}
      graphData={displayedData}
      onNodeClick={handleClick}
      onEngineTick={handleEngineTick}
      linkAutoColorBy="contract_address"
      nodeCanvasObject={nodeCanvasObject}
      linkCanvasObject={linkCanvasObject}
      cooldownTime={6000}
      d3AlphaDecay={GRAPH_CONFIG.d3AlphaDecay}
      d3VelocityDecay={GRAPH_CONFIG.d3VelocityDecay}
    />
  );
}, arePropsEqual);
