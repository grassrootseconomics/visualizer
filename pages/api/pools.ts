/**
 * Pools API endpoint
 * Serves swap pools with their allowed tokens and caching
 */

import { cacheWithExpiry } from "@utils/cache";
import { fetchPools } from "@lib/api/queries";
import { POOLS_CACHE_KEY, POOLS_CACHE_TTL_SECONDS } from "@config/cache";
import type { NextApiRequest, NextApiResponse } from "next";
import type { PoolsResponse, Pool } from "@/types";

async function fetchPoolsData(): Promise<PoolsResponse> {
  const rows = await fetchPools();

  const pools: Pool[] = rows.map((row) => ({
    pool_address: row.pool_address,
    pool_name: row.pool_name,
    pool_symbol: row.pool_symbol,
    owner_address: row.owner_address,
    allowed_tokens: row.allowed_tokens,
  }));

  return {
    pools,
    lastUpdate: Date.now(),
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const bypass = req.query.refresh === "true";
    const data = await cacheWithExpiry(
      POOLS_CACHE_KEY,
      POOLS_CACHE_TTL_SECONDS,
      fetchPoolsData,
      bypass
    );
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching pools:", error);
    return res.status(500).json({
      error: "Failed to fetch pools",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
