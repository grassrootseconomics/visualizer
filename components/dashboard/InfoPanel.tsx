/**
 * Info panel for displaying selected node or link details
 */

import React from "react";
import { CloseIcon, CopyIcon, ExternalLinkIcon } from "@components/icons";
import type { Voucher } from "@/types/voucher";

export interface NodeInfo {
  id: string;
  value: number;
  usedVouchers: Record<string, { firstTxDate: number; txCount: number }>;
}

export interface LinkInfo {
  source: string;
  target: string;
  token_name: string;
  token_symbol: string;
  contract_address: string;
  txCount: number;
  value: number;
  date: number;
  dateFirst: number;
}

export type SelectedInfo =
  | { type: "node"; data: NodeInfo }
  | { type: "link"; data: LinkInfo }
  | null;

export interface InfoPanelProps {
  selectedInfo: SelectedInfo;
  onClose: () => void;
  vouchers: Voucher[] | undefined;
  copiedField: string | null;
  copyToClipboard: (text: string, field: string) => void;
}

export function InfoPanel({
  selectedInfo,
  onClose,
  vouchers,
  copiedField,
  copyToClipboard,
}: InfoPanelProps) {
  if (!selectedInfo) return null;

  return (
    <div className="absolute top-4 left-4 z-20 w-80 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600">
        <h2 className="text-white font-semibold">
          {selectedInfo.type === "node" ? "Account" : "Transaction"}
        </h2>
        <CloseIcon
          onClick={onClose}
          className="w-5 h-5 cursor-pointer text-white/70 hover:text-white transition-colors"
        />
      </div>

      <div className="p-4 space-y-3">
        {selectedInfo.type === "node" ? (
          <NodeInfoContent
            data={selectedInfo.data}
            vouchers={vouchers}
            copiedField={copiedField}
            copyToClipboard={copyToClipboard}
          />
        ) : (
          <LinkInfoContent
            data={selectedInfo.data}
            copiedField={copiedField}
            copyToClipboard={copyToClipboard}
          />
        )}
      </div>
    </div>
  );
}

interface NodeInfoContentProps {
  data: NodeInfo;
  vouchers: Voucher[] | undefined;
  copiedField: string | null;
  copyToClipboard: (text: string, field: string) => void;
}

function NodeInfoContent({
  data,
  vouchers,
  copiedField,
  copyToClipboard,
}: NodeInfoContentProps) {
  return (
    <>
      {/* Node Address */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">Address</label>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm bg-gray-100 text-gray-500 px-2 py-1.5 rounded font-mono truncate">
            {data.id}
          </code>
          <button
            onClick={() => copyToClipboard(data.id, "address")}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Copy address"
          >
            <CopyIcon
              className={`w-4 h-4 ${
                copiedField === "address" ? "text-green-500" : "text-gray-500"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Transaction count */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">
          Total Transactions
        </label>
        <p className="text-sm font-medium text-gray-700">{data.value}</p>
      </div>

      {/* Vouchers used with details */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">
          Vouchers Used ({Object.keys(data.usedVouchers).length})
        </label>
        <div className="max-h-40 overflow-y-auto space-y-1.5">
          {Object.entries(data.usedVouchers)
            .sort(([, a], [, b]) => b.txCount - a.txCount)
            .map(([contractAddress, { firstTxDate, txCount }]) => {
              const voucher = vouchers?.find(
                (v) => v.contract_address === contractAddress
              );
              return (
                <div
                  key={contractAddress}
                  className="flex items-center justify-between text-sm bg-gray-50 px-2 py-1.5 rounded"
                >
                  <span className="text-gray-700 truncate flex-1">
                    {voucher
                      ? `${voucher.token_name} (${voucher.token_symbol})`
                      : contractAddress.slice(0, 10) + "..."}
                  </span>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs font-medium text-emerald-600 whitespace-nowrap">
                      {txCount} tx
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(firstTxDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* External links */}
      <a
        href={`https://celoscan.io/address/${data.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 w-full px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md transition-colors text-sm font-medium"
      >
        <ExternalLinkIcon className="w-4 h-4" />
        View on Celoscan
      </a>
      <a
        href={`https://sarafu.network/users/${data.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 w-full px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md transition-colors text-sm font-medium"
      >
        <ExternalLinkIcon className="w-4 h-4" />
        View on Sarafu Network
      </a>
    </>
  );
}

interface LinkInfoContentProps {
  data: LinkInfo;
  copiedField: string | null;
  copyToClipboard: (text: string, field: string) => void;
}

function LinkInfoContent({
  data,
  copiedField,
  copyToClipboard,
}: LinkInfoContentProps) {
  return (
    <>
      {/* Token info */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">Token</label>
        <p className="text-sm font-medium text-gray-700">
          {data.token_name} ({data.token_symbol})
        </p>
      </div>

      {/* Contract address */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">Contract</label>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm text-gray-500 px-2 py-1.5 rounded font-mono truncate">
            {data.contract_address}
          </code>
          <button
            onClick={() => copyToClipboard(data.contract_address, "contract")}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Copy contract"
          >
            <CopyIcon
              className={`w-4 h-4 ${
                copiedField === "contract" ? "text-green-500" : "text-gray-500"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Source */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">From</label>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs text-gray-500 px-2 py-1 rounded font-mono truncate">
            {data.source}
          </code>
          <button
            onClick={() => copyToClipboard(data.source, "source")}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Copy source"
          >
            <CopyIcon
              className={`w-3 h-3 ${
                copiedField === "source" ? "text-green-500" : "text-gray-500"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Target */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">To</label>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs text-gray-500 px-2 py-1 rounded font-mono truncate">
            {data.target}
          </code>
          <button
            onClick={() => copyToClipboard(data.target, "target")}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Copy target"
          >
            <CopyIcon
              className={`w-3 h-3 ${
                copiedField === "target" ? "text-green-500" : "text-gray-500"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Transactions
          </label>
          <p className="text-sm font-medium text-gray-700">{data.txCount}</p>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Total Value</label>
          <p className="text-sm font-medium text-gray-700">
            {data.value.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* Date range */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">
          Activity Period
        </label>
        <p className="text-sm text-gray-700">
          {new Date(data.dateFirst).toLocaleDateString()} -{" "}
          {new Date(data.date).toLocaleDateString()}
        </p>
      </div>

      {/* External link */}
      <a
        href={`https://sarafu.network/vouchers/${data.contract_address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 w-full px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md transition-colors text-sm font-medium"
      >
        <ExternalLinkIcon className="w-4 h-4" />
        View on Sarafu Network
      </a>
    </>
  );
}
