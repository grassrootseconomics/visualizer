/**
 * Custom comparison function to prevent unnecessary re-renders
 * Used by both NetworkGraph2d and NetworkGraph3d
 */

import type { GraphComponentProps } from "@/types/graph";

export function arePropsEqual(
  prevProps: GraphComponentProps,
  nextProps: GraphComponentProps
): boolean {
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
}
