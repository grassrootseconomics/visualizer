/**
 * Label creation helpers for graph nodes and links
 */

import { LABEL_STYLE } from "@/config/graph";

/**
 * Create an HTML label for a node
 */
export function createNodeLabel(id: string): string {
  return `<span style="${LABEL_STYLE}">${id}</span>`;
}

/**
 * Create an HTML label for a link
 */
export function createLinkLabel(
  tokenSymbol: string,
  tokenName: string,
  txCount?: number
): string {
  const countStr = txCount && txCount > 1 ? ` (${txCount} txns)` : "";
  return `<span style="${LABEL_STYLE}">${tokenSymbol} ${tokenName}${countStr}</span>`;
}
