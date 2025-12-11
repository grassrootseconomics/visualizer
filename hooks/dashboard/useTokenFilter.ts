/**
 * Hook for managing token/voucher filtering
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Voucher } from "@/types/voucher";
import type { GraphData } from "@/types/graph";

export interface UseTokenFilterOptions {
  vouchers: Voucher[] | undefined;
  graphData: GraphData | undefined;
}

export interface UseTokenFilterReturn {
  // Selected tokens for filtering
  selectedTokens: Voucher[];
  setSelectedTokens: (tokens: Voucher[]) => void;
  // Filtered graph data
  filteredByToken: GraphData;
  // Helpers
  selectAll: () => void;
  clearAll: () => void;
  isAllSelected: boolean;
}

export function useTokenFilter({
  vouchers,
  graphData,
}: UseTokenFilterOptions): UseTokenFilterReturn {
  const [selectedTokens, setSelectedTokens] = useState<Voucher[]>([]);
  const [filteredByToken, setFilteredByToken] = useState<GraphData>({
    nodes: [],
    links: [],
  });

  // Initialize selected tokens when vouchers load
  useEffect(() => {
    if (vouchers) {
      setSelectedTokens(vouchers);
    }
  }, [vouchers]);

  // Initialize filtered data when graph data loads
  useEffect(() => {
    if (graphData) {
      setFilteredByToken(graphData);
    }
  }, [graphData]);

  // Filter graph data when selected tokens change
  useEffect(() => {
    if (!graphData) return;

    const selectedAddresses = new Set(
      selectedTokens.map((t) => t.contract_address)
    );

    const newGraphData: GraphData = {
      nodes: graphData.nodes.filter((node) =>
        Object.keys(node.usedVouchers).some((addr) =>
          selectedAddresses.has(addr)
        )
      ),
      links: graphData.links.filter((link) =>
        selectedAddresses.has(link.contract_address)
      ),
    };

    setFilteredByToken(newGraphData);
  }, [graphData, selectedTokens]);

  const selectAll = useCallback(() => {
    if (vouchers) {
      setSelectedTokens(vouchers);
    }
  }, [vouchers]);

  const clearAll = useCallback(() => {
    setSelectedTokens([]);
  }, []);

  const isAllSelected = useMemo(() => {
    return vouchers ? selectedTokens.length === vouchers.length : false;
  }, [selectedTokens.length, vouchers]);

  return {
    selectedTokens,
    setSelectedTokens,
    filteredByToken,
    selectAll,
    clearAll,
    isAllSelected,
  };
}
