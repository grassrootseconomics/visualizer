import { kv } from "@vercel/kv";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Try to get data from KV cache
    const cachedData = await kv.get("graph-data");

    if (!cachedData) {
      return res.status(404).json({
        error: "No data available",
        message:
          "Graph data not found in cache. Please run the cron job first.",
      });
    }

    // Parse the cached data
    const data =
      typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;

    // Set cache headers for browser caching (5 minutes)
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching graph data:", error);
    return res.status(500).json({
      error: "Failed to fetch graph data",
      details: error.message,
    });
  }
}
