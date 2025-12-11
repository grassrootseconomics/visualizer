/**
 * Graph algorithms for analysis and clustering
 */

import type { GraphNode, GraphLink, RenderedGraphLink } from "@/types/graph";
import { getSourceId, getTargetId } from "./link-utils";

/**
 * Find the largest connected component in the graph using BFS
 */
export function findLargestCluster(
  nodes: GraphNode[],
  links: (GraphLink | RenderedGraphLink)[]
): GraphNode[] {
  if (nodes.length === 0) return [];

  // Build adjacency list
  const adjacency = new Map<string, Set<string>>();
  nodes.forEach((n) => adjacency.set(n.id, new Set()));

  links.forEach((link) => {
    const srcId = getSourceId(link);
    const tgtId = getTargetId(link);
    adjacency.get(srcId)?.add(tgtId);
    adjacency.get(tgtId)?.add(srcId);
  });

  const visited = new Set<string>();
  const components: string[][] = [];

  // Find all connected components using BFS
  for (const node of nodes) {
    if (visited.has(node.id)) continue;

    const component: string[] = [];
    const queue = [node.id];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;

      visited.add(current);
      component.push(current);

      adjacency.get(current)?.forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      });
    }

    components.push(component);
  }

  // Find the largest component
  const largest = components.reduce<string[]>(
    (max, comp) => (comp.length > max.length ? comp : max),
    []
  );

  const largestSet = new Set(largest);
  return nodes.filter((n) => largestSet.has(n.id));
}
