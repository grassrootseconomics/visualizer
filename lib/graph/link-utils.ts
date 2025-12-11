/**
 * Utility functions for working with graph links
 */

import type { GraphLink, RenderedGraphLink, GraphNode } from "@/types/graph";

/**
 * Generate a unique key for a link
 * Works with both API links (string source/target) and rendered links (object source/target)
 */
export function getLinkKey(link: GraphLink | RenderedGraphLink): string {
  const src = getSourceId(link);
  const tgt = getTargetId(link);
  // Use contract_address for unique key since links are now aggregated per source-target-contract
  const contract = link.contract_address || link.date;
  return `${src}|${tgt}|${contract}`;
}

/**
 * Get the source node ID from a link
 * Handles both string and object forms
 */
export function getSourceId(link: GraphLink | RenderedGraphLink): string {
  return typeof link.source === "object"
    ? (link.source as GraphNode).id
    : link.source;
}

/**
 * Get the target node ID from a link
 * Handles both string and object forms
 */
export function getTargetId(link: GraphLink | RenderedGraphLink): string {
  return typeof link.target === "object"
    ? (link.target as GraphNode).id
    : link.target;
}

/**
 * Resolve link endpoints to coordinates (only works with rendered links)
 */
export function resolveLinkEndpoints(link: RenderedGraphLink): {
  source: { x: number; y: number; z?: number };
  target: { x: number; y: number; z?: number };
} {
  const defaultPos = { x: 0, y: 0, z: 0 };

  const source = typeof link.source === "object"
    ? { x: (link.source as GraphNode).x ?? 0, y: (link.source as GraphNode).y ?? 0, z: (link.source as GraphNode).z }
    : defaultPos;

  const target = typeof link.target === "object"
    ? { x: (link.target as GraphNode).x ?? 0, y: (link.target as GraphNode).y ?? 0, z: (link.target as GraphNode).z }
    : defaultPos;

  return { source, target };
}
