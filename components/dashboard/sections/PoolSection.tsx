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
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium text-gray-700">Filter by Pool</span>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-500 transition-transform ${
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
              className="flex-1 px-3 py-2 sm:py-1.5 text-sm text-green-600 border border-green-200 rounded-md hover:bg-green-50 active:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onSelectPools(pools)}
              disabled={isLoading}
            >
              Select All
            </button>
            <button
              className="flex-1 px-3 py-2 sm:py-1.5 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onSelectPools([])}
              disabled={isLoading}
            >
              Clear
            </button>
          </div>
          {selectedPools.length > 0 && (
            <div className="text-sm text-gray-500">
              {totalTokens} token{totalTokens !== 1 ? "s" : ""} in{" "}
              {selectedPools.length} pool{selectedPools.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
