/**
 * Globe geographic data API endpoint
 * Serves geo-enriched graph data with caching
 */

import { cacheWithExpiry } from "@utils/cache";
import { fetchGlobeData } from "@lib/api/data-service";
import { GLOBE_CACHE_KEY, GLOBE_CACHE_TTL_SECONDS } from "@config/cache";
import type { NextApiRequest, NextApiResponse } from "next";

export type { GlobeDataResponse } from "@/types/globe";

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
      GLOBE_CACHE_KEY,
      GLOBE_CACHE_TTL_SECONDS,
      fetchGlobeData,
      bypass
    );
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching globe data:", error);
    return res.status(500).json({
      error: "Failed to fetch globe data",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export const config = {
  maxDuration: 300,
  api: {
    responseLimit: false,
  },
};
