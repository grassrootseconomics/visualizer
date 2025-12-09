import { cacheWithExpiry } from "@utils/cache";

import { federatedDB } from "@db/db";
import { generateGraphData } from "@utils/render_graph";
import { NextApiRequest, NextApiResponse } from "next";

const FAUCET_ADDRESS = "0x5523058cdFfe5F3c1EaDADD5015E55C6E00fb439";
const CACHE_KEY = "graph-data-2";
const CACHE_TTL_SECONDS = 86400 * 30; // 24 hours

function fetchTransactions() {
  return (
    federatedDB
      .selectFrom("chain_data.token_transfer")
      .innerJoin(
        "chain_data.tx",
        "chain_data.token_transfer.tx_id",
        "chain_data.tx.id"
      )
      .select([
        "chain_data.tx.id",
        "chain_data.token_transfer.sender_address",
        "chain_data.token_transfer.recipient_address",
        "chain_data.token_transfer.contract_address",
        "chain_data.token_transfer.transfer_value as tx_value",
        "chain_data.tx.date_block",
        "chain_data.tx.success",
        "chain_data.tx.tx_hash",
        "chain_data.tx.block_number",
      ])
      .where("chain_data.tx.success", "=", true)
      .where("chain_data.token_transfer.sender_address", "!=", FAUCET_ADDRESS)
      .where(
        "chain_data.token_transfer.recipient_address",
        "!=",
        FAUCET_ADDRESS
      )
      // Last 2 months
      .where(
        "chain_data.tx.date_block",
        ">=",
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      )
      .execute()
  );
}
function fetchVouchers() {
  return federatedDB.selectFrom("chain_data.tokens").selectAll().execute();
}
async function fetchData() {
  const vouchers = await fetchVouchers();
  const rawTransactions = await fetchTransactions();

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

  // Prepare data for storage
  const data = {
    graphData,
    vouchers: vouchers.map((v) => ({
      ...v,
    })),
    lastUpdate: Date.now(),
  };

  return data;
}
export type DataResponse = Awaited<ReturnType<typeof fetchData>>;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = await cacheWithExpiry(CACHE_KEY, CACHE_TTL_SECONDS, fetchData);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching graph data:");
    return res.status(500).json({
      error: "Failed to fetch graph data",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};
