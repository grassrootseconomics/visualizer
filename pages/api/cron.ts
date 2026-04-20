/**
 * Cron endpoint to pre-warm caches
 * Scheduled via vercel.json to run every 6 hours
 */

import { cacheWithExpiry } from "@utils/cache";
import { fetchGraphData, fetchGlobeData } from "@lib/api/data-service";
import {
  CACHE_KEY,
  CACHE_TTL_SECONDS,
  GLOBE_CACHE_KEY,
  GLOBE_CACHE_TTL_SECONDS,
} from "@config/cache";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await Promise.all([
      cacheWithExpiry(CACHE_KEY, CACHE_TTL_SECONDS, fetchGraphData, true),
      cacheWithExpiry(
        GLOBE_CACHE_KEY,
        GLOBE_CACHE_TTL_SECONDS,
        fetchGlobeData,
        true
      ),
    ]);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Cron cache warm failed:", error);
    return res.status(500).json({
      error: "Cache warm failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export const config = {
  maxDuration: 120,
};
