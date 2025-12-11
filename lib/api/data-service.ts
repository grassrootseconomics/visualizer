/**
 * Data fetching service - orchestrates database queries and transformations
 */

import { fetchTransactions } from "./queries/transactions";
import { fetchVouchers } from "./queries/vouchers";
import { generateGraphData } from "./transformers/graph-transformer";
import type { DataResponse } from "@/types/api";

/**
 * Fetch and transform graph data from the database
 */
export async function fetchGraphData(): Promise<DataResponse> {
  // Fetch data in parallel
  const [vouchers, rawTransactions] = await Promise.all([
    fetchVouchers(),
    fetchTransactions(),
  ]);

  // Transform transactions to match expected format
  const transactions = rawTransactions.map((tx, index) => ({
    ...tx,
    tx_type: "token_transfer",
    tx_index: index,
  }));

  // Generate graph data
  const graphData = generateGraphData({
    vouchers: [...vouchers],
    transactions,
  });

  return {
    graphData,
    vouchers: vouchers.map((v) => ({ ...v })),
    lastUpdate: Date.now(),
  };
}
