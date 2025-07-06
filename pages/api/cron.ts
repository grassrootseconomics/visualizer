import { kv } from "@vercel/kv";
import { NextApiRequest, NextApiResponse } from "next";
import { graphDB, indexerDB } from "../../db/db";
import { generateGraphData } from "../../utils/render_graph";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify this is a cron request (optional security check)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Optional: Add authorization header check for cron security
  const authHeader = req.headers.authorization;
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    console.log("Starting cron job to update graph data...");

    // Fetch vouchers from graph database
    const vouchersP = graphDB.selectFrom("vouchers").selectAll().execute();

    // Fetch transactions from indexer database
    const faucet = "0x5523058cdFfe5F3c1EaDADD5015E55C6E00fb439";
    const transactionsP = indexerDB
      .selectFrom("token_transfer")
      .innerJoin("tx", "token_transfer.tx_id", "tx.id")
      .select([
        "tx.id",
        "token_transfer.sender_address",
        "token_transfer.recipient_address",
        "token_transfer.contract_address as voucher_address",
        "token_transfer.transfer_value as tx_value",
        "tx.date_block",
        "tx.success",
        "tx.tx_hash",
        "tx.block_number",
      ])
      .where("tx.success", "=", true)
      .where("token_transfer.sender_address", "!=", faucet)
      .where("token_transfer.recipient_address", "!=", faucet)
      .execute();

    const [vouchers, rawTransactions] = await Promise.all([
      vouchersP,
      transactionsP,
    ]);

    // Transform transactions to match expected format
    const transactions = rawTransactions.map((tx) => ({
      ...tx,
      tx_type: "token_transfer",
      tx_index: 0,
    }));

    // Generate graph data
    const graphData = generateGraphData({
      vouchers: [...vouchers],
      transactions,
    });

    // Prepare data for storage
    const dataToStore = {
      graphData,
      vouchers: vouchers.map((v) => ({
        ...v,
        created_at: v.created_at.getTime(),
      })),
      lastUpdate: Date.now(),
    };

    // Store in Vercel KV with 24 hour TTL
    await kv.setex("graph-data", 86400, JSON.stringify(dataToStore));

    console.log("Graph data updated successfully in KV");

    return res.status(200).json({
      success: true,
      message: "Graph data updated successfully",
      vouchers: vouchers.length,
      transactions: transactions.length,
      lastUpdate: dataToStore.lastUpdate,
    });
  } catch (error) {
    console.error("Error updating graph data:", error);
    return res.status(500).json({
      error: "Failed to update graph data",
      details: error.message,
    });
  }
}
