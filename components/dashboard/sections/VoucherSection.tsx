/**
 * Voucher filter section component
 */

import React from "react";
import { ChevronDownIcon } from "@components/icons";
import { MultiSelect } from "@components/select";
import type { Voucher } from "@/types/voucher";

export interface VoucherSectionProps {
  expanded: boolean;
  onToggle: () => void;
  selectedTokens: Voucher[];
  allVouchers: Voucher[];
  onSelectTokens: (tokens: Voucher[]) => void;
}

export function VoucherSection({
  expanded,
  onToggle,
  selectedTokens,
  allVouchers,
  onSelectTokens,
}: VoucherSectionProps) {
  return (
    <div className="border border-white/10 rounded-lg">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/[0.08] transition-colors"
      >
        <span className="font-medium text-gray-200">Filter Vouchers</span>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-400 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {expanded && (
        <div className="p-3 sm:p-4 space-y-3">
          <MultiSelect
            selected={selectedTokens}
            options={allVouchers}
            label="Select Vouchers"
            optionToKey={(o: Voucher) => o.contract_address}
            optionToLabel={(o: Voucher) =>
              `${o.token_name} (${o.token_symbol})`
            }
            optionToSearchFields={(o: Voucher) => [o.token_name, o.token_symbol]}
            prioritizeSymbol="cUSD"
            onChange={onSelectTokens}
          />
          <div className="flex gap-2">
            <button
              className="flex-1 px-3 py-2 sm:py-1.5 text-sm text-emerald-400 border border-emerald-500/30 rounded-md hover:bg-emerald-500/10 active:bg-emerald-500/20 transition-colors"
              onClick={() => onSelectTokens(allVouchers)}
            >
              Select All
            </button>
            <button
              className="flex-1 px-3 py-2 sm:py-1.5 text-sm text-gray-400 border border-white/10 rounded-md hover:bg-white/5 active:bg-white/10 transition-colors"
              onClick={() => onSelectTokens([])}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
