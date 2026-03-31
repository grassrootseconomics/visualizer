/**
 * Data fetching service - orchestrates database queries and transformations
 */

import { fetchTransactions } from "./queries/transactions";
import { fetchVouchers } from "./queries/vouchers";
import {
  fetchAccountGeoLocations,
  fetchVoucherGeoLocations,
  fetchPoolSwapTransactions,
} from "./queries/geo-data";
import { fetchPools } from "./queries/pools";
import { generateGraphData } from "./transformers/graph-transformer";
import { generateGlobeData } from "./transformers/globe-transformer";
import type { DataResponse } from "@/types/api";
import type { GlobeDataResponse } from "@/types/globe";

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

/**
 * Fetch and transform globe (geographic) data from the database
 */
export async function fetchGlobeData(): Promise<GlobeDataResponse> {
  const [
    accountGeos,
    voucherGeos,
    poolSwaps,
    rawTransactions,
    vouchers,
    pools,
  ] = await Promise.all([
    fetchAccountGeoLocations(),
    fetchVoucherGeoLocations(),
    fetchPoolSwapTransactions(),
    fetchTransactions(),
    fetchVouchers(),
    fetchPools(),
  ]);

  const globeData = generateGlobeData({
    accountGeos,
    voucherGeos,
    poolSwaps,
    transactions: rawTransactions,
    vouchers: [...vouchers],
    pools,
  });

  return {
    globeData,
    lastUpdate: Date.now(),
  };
}
