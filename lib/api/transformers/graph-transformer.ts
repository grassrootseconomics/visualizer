/**
 * Graph data transformation from raw database records
 */

import { getFormattedValue } from "@utils/units";
import type { Voucher, Transaction, NetworkData } from "@/types/voucher";
import type { GraphData, GraphNode, GraphLink } from "@/types/graph";

interface LinkData {
  token_name: string;
  token_symbol: string;
  source: string;
  target: string;
  contract_address: string;
  date: number; // Most recent transaction date
  dateFirst: number; // First transaction date
  value: number; // Total aggregated value
  txCount: number; // Number of transactions aggregated
}

interface AddressData {
  usedVouchers: Map<string, { firstTxDate: number; txCount: number }>;
  transactionCount: number;
}

/**
 * Update address tracking data for a transaction
 */
function updateAddress(
  addresses: Map<string, AddressData>,
  address: string,
  voucherAddress: string,
  txDateTime: number
): void {
  let addressData = addresses.get(address);

  if (!addressData) {
    addressData = {
      usedVouchers: new Map(),
      transactionCount: 1,
    };
    addresses.set(address, addressData);
  } else {
    addressData.transactionCount++;
  }

  // Update voucher usage with transaction count and first date
  const existingVoucher = addressData.usedVouchers.get(voucherAddress);
  if (existingVoucher === undefined) {
    addressData.usedVouchers.set(voucherAddress, {
      firstTxDate: txDateTime,
      txCount: 1,
    });
  } else {
    // Increment count and update first date if earlier
    existingVoucher.txCount++;
    if (txDateTime < existingVoucher.firstTxDate) {
      existingVoucher.firstTxDate = txDateTime;
    }
  }
}

/**
 * Generate graph data from network transaction data
 *
 * Aggregates multiple transactions between the same node pairs into
 * single weighted links for better visualization performance.
 */
export function generateGraphData(network: NetworkData): GraphData {
  // Pre-index vouchers by address for O(1) lookup
  const voucherMap = new Map<string, Voucher>();
  for (const voucher of network.vouchers) {
    voucherMap.set(voucher.contract_address, voucher);
  }

  // Use Map for O(1) link lookups
  // AGGREGATION: Links are keyed by source-target-contract (no timestamp)
  // This combines multiple transactions between same nodes into one weighted link
  const linkMap = new Map<string, LinkData>();

  // Track addresses and their transaction counts
  // usedVouchers now stores { firstTxDate, txCount } per voucher
  const nodeMap = new Map<string, AddressData>();

  // Process transactions once
  for (const tx of network.transactions) {
    const txDateTime = tx.date_block.getTime();
    // AGGREGATION KEY: No timestamp - combines all transactions between same pair for same token
    const linkKey = `${tx.sender_address}-${tx.recipient_address}-${tx.contract_address}`;

    // Handle links
    const existingLink = linkMap.get(linkKey);
    const voucher = voucherMap.get(tx.contract_address);
    const txValue = getFormattedValue(
      BigInt(tx.tx_value),
      voucher?.token_decimals ?? 18
    ).formattedNumber;

    if (existingLink) {
      // Aggregate: add value, update dates, increment count
      existingLink.value += txValue;
      existingLink.txCount++;
      // Track most recent date for filtering
      if (txDateTime > existingLink.date) {
        existingLink.date = txDateTime;
      }
      // Track first date
      if (txDateTime < existingLink.dateFirst) {
        existingLink.dateFirst = txDateTime;
      }
    } else {
      linkMap.set(linkKey, {
        token_name: voucher?.token_name ?? "Unknown",
        token_symbol: voucher?.token_symbol ?? "Unknown",
        source: tx.sender_address,
        target: tx.recipient_address,
        contract_address: tx.contract_address,
        date: txDateTime,
        dateFirst: txDateTime,
        value: txValue,
        txCount: 1,
      });
    }

    // Handle addresses (both sender and recipient)
    updateAddress(nodeMap, tx.sender_address, tx.contract_address, txDateTime);
    updateAddress(
      nodeMap,
      tx.recipient_address,
      tx.contract_address,
      txDateTime
    );
  }

  // Convert to arrays
  const links = Array.from(linkMap.values()) as GraphLink[];
  const nodes = Array.from(nodeMap.entries()).map(
    ([address, data]) => ({
      id: address,
      group: 1,
      usedVouchers: Object.fromEntries(data.usedVouchers),
      value: data.transactionCount,
    })
  ) as GraphNode[];

  return { links, nodes };
}
