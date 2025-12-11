/**
 * Hook for filtering graph data by date and recency
 */

import { useMemo } from "react";
import type { GraphData } from "@/types/graph";
import { TWO_MONTHS_MS } from "@/config/constants";

export interface DateRange {
  start: number;
  end: number;
}

export interface UseGraphFilteringOptions {
  filteredByToken: GraphData;
  currentDate: number;
  showRecentOnly: boolean;
}

export interface UseGraphFilteringReturn {
  // Filtered graph data ready for rendering
  graphData: GraphData;
  // Date range derived from links
  dateRange: DateRange;
  // Available node IDs (for validation)
  availableNodeIds: Set<string>;
}

export function useGraphFiltering({
  filteredByToken,
  currentDate,
  showRecentOnly,
}: UseGraphFilteringOptions): UseGraphFilteringReturn {
  // Derive dateRange from filtered links
  const dateRange = useMemo<DateRange>(() => {
    if (!filteredByToken.links.length) {
      const now = Date.now();
      return { start: now, end: now };
    }
    let start = Infinity;
    let end = 0;
    for (const link of filteredByToken.links) {
      if (link.date < start) start = link.date;
      if (link.date > end) end = link.date;
    }
    return { start, end };
  }, [filteredByToken.links]);

  // Memoize available node IDs
  const availableNodeIds = useMemo(
    () => new Set(filteredByToken.nodes.map((n) => n.id)),
    [filteredByToken.nodes]
  );

  // Filter graph data by date
  const graphData = useMemo<GraphData>(() => {
    // Calculate the recency cutoff (2 months before the reference date)
    const recencyCutoff = showRecentOnly ? currentDate - TWO_MONTHS_MS : 0;

    // Filter links: must be in date range AND both source/target must exist
    const activeLinks = filteredByToken.links.filter((link) => {
      // Short-circuit: check cheapest conditions first
      if (link.date > currentDate) return false;
      if (link.date < recencyCutoff) return false;
      return (
        availableNodeIds.has(link.source) && availableNodeIds.has(link.target)
      );
    });

    // Get all addresses that have been active in transactions
    const activeAddresses = new Set<string>();
    activeLinks.forEach((link) => {
      activeAddresses.add(link.source);
      activeAddresses.add(link.target);
    });

    // Filter nodes
    const filteredNodes = filteredByToken.nodes.filter((node) =>
      activeAddresses.has(node.id)
    );

    return {
      nodes: filteredNodes,
      links: activeLinks,
    };
  }, [filteredByToken, availableNodeIds, currentDate, showRecentOnly]);

  return {
    graphData,
    dateRange,
    availableNodeIds,
  };
}
