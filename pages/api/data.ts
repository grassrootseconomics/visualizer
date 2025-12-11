/**
 * Graph data API endpoint
 * Serves pre-processed graph data with caching
 */

import { cacheWithExpiry } from "@utils/cache";
import { fetchGraphData } from "@lib/api/data-service";
import { CACHE_KEY, CACHE_TTL_SECONDS } from "@config/cache";
import type { NextApiRequest, NextApiResponse } from "next";

// Re-export DataResponse type for backward compatibility
export type { DataResponse } from "@/types/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = await cacheWithExpiry(
      CACHE_KEY,
      CACHE_TTL_SECONDS,
      fetchGraphData
    );
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching graph data:", error);
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
