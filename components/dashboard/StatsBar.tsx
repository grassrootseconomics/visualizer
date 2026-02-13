/**
 * Stats display component showing node, link, and voucher counts
 */

import React from "react";

export interface StatsBarProps {
  nodeCount: number;
  linkCount: number;
  voucherCount: number;
}

export function StatsBar({ nodeCount, linkCount, voucherCount }: StatsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-2 p-3 bg-white/5 border border-white/5 rounded-lg">
      <div className="text-center">
        <p className="text-lg sm:text-xl font-bold text-emerald-400">
          {nodeCount}
        </p>
        <p className="text-xs text-gray-400">Nodes</p>
      </div>
      <div className="text-center">
        <p className="text-lg sm:text-xl font-bold text-emerald-300">
          {linkCount}
        </p>
        <p className="text-xs text-gray-400">Links</p>
      </div>
      <div className="text-center">
        <p className="text-lg sm:text-xl font-bold text-teal-400">
          {voucherCount}
        </p>
        <p className="text-xs text-gray-400">Vouchers</p>
      </div>
    </div>
  );
}
