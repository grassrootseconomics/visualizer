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
    <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
      <div className="text-center">
        <p className="text-lg sm:text-xl font-bold text-green-600">
          {nodeCount}
        </p>
        <p className="text-xs text-gray-500">Nodes</p>
      </div>
      <div className="text-center">
        <p className="text-lg sm:text-xl font-bold text-emerald-600">
          {linkCount}
        </p>
        <p className="text-xs text-gray-500">Links</p>
      </div>
      <div className="text-center">
        <p className="text-lg sm:text-xl font-bold text-teal-600">
          {voucherCount}
        </p>
        <p className="text-xs text-gray-500">Vouchers</p>
      </div>
    </div>
  );
}
