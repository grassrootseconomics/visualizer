/**
 * Pool filter section component
 */

import React from "react";
import { ChevronDownIcon } from "@components/icons";
import { MultiSelect } from "@components/select";
import type { Pool } from "@/types";

export interface PoolSectionProps {
  expanded: boolean;
  onToggle: () => void;
  pools: Pool[];
  selectedPools: Pool[];
  onSelectPools: (pools: Pool[]) => void;
  isLoading?: boolean;
}

export function PoolSection({
  expanded,
  onToggle,
  pools,
  selectedPools,
  onSelectPools,
  isLoading,
}: PoolSectionProps) {
  // Calculate total unique tokens across selected pools
  const totalTokens = React.useMemo(() => {
    if (selectedPools.length === 0) return 0;
    const tokenSet = new Set<string>();
    for (const pool of selectedPools) {
      for (const token of pool.allowed_tokens) {
        tokenSet.add(token.toLowerCase());
      }
    }
    return tokenSet.size;
  }, [selectedPools]);

  return (
    <div className="border border-white/10 rounded-lg">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/[0.08] transition-colors"
      >
        <span className="font-medium text-gray-200">Filter by Pool</span>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-400 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {expanded && (
        <div className="p-3 sm:p-4 space-y-3">
          <MultiSelect
            selected={selectedPools}
            options={pools}
            label="Select Pools"
            optionToKey={(p: Pool) => p.pool_address}
            optionToLabel={(p: Pool) => `${p.pool_name} (${p.pool_symbol})`}
            optionToSearchFields={(p: Pool) => [p.pool_name, p.pool_symbol]}
            onChange={onSelectPools}
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <button
              className="flex-1 px-3 py-2 sm:py-1.5 text-sm text-emerald-400 border border-emerald-500/30 rounded-md hover:bg-emerald-500/10 active:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onSelectPools(pools)}
              disabled={isLoading}
            >
              Select All
            </button>
            <button
              className="flex-1 px-3 py-2 sm:py-1.5 text-sm text-gray-400 border border-white/10 rounded-md hover:bg-white/5 active:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onSelectPools([])}
              disabled={isLoading}
            >
              Clear
            </button>
          </div>
          {selectedPools.length > 0 && (
            <div className="text-sm text-gray-400">
              {totalTokens} token{totalTokens !== 1 ? "s" : ""} in{" "}
              {selectedPools.length} pool{selectedPools.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
