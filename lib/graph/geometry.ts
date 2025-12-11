/**
 * Geometry helpers for graph calculations
 */

interface PositionedNode {
  x?: number;
  y?: number;
  z?: number;
}

/**
 * Calculate the centroid (center of mass) of positioned nodes
 */
export function calculateCentroid(
  nodes: PositionedNode[]
): { x: number; y: number; z: number } | null {
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  let count = 0;

  for (const node of nodes) {
    if (node.x !== undefined && node.y !== undefined) {
      sumX += node.x;
      sumY += node.y;
      sumZ += node.z || 0;
      count++;
    }
  }

  if (count === 0) return null;

  return {
    x: sumX / count,
    y: sumY / count,
    z: sumZ / count,
  };
}
