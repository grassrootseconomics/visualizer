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
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium text-gray-700">Filter Vouchers</span>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-500 transition-transform ${
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
              className="flex-1 px-3 py-2 sm:py-1.5 text-sm text-green-600 border border-green-200 rounded-md hover:bg-green-50 active:bg-green-100 transition-colors"
              onClick={() => onSelectTokens(allVouchers)}
            >
              Select All
            </button>
            <button
              className="flex-1 px-3 py-2 sm:py-1.5 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors"
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
