/**
 * Field reports API endpoint
 * Serves approved field reports with caching
 */

import { cacheWithExpiry } from "@utils/cache";
import { fetchApprovedFieldReports } from "@lib/api/queries";
import { REPORTS_CACHE_KEY, REPORTS_CACHE_TTL_SECONDS } from "@config/cache";
import type { NextApiRequest, NextApiResponse } from "next";
import type { FieldReportsResponse, FieldReport } from "@/types";

async function fetchReports(): Promise<FieldReportsResponse> {
  const rows = await fetchApprovedFieldReports();

  // Transform database rows to API response format
  const reports: FieldReport[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    period_from: row.period_from ? new Date(row.period_from).getTime() : 0,
    period_to: row.period_to ? new Date(row.period_to).getTime() : null,
    location: row.location,
    image_url: row.image_url,
    tags: row.tags,
    vouchers: row.vouchers,
    created_at: row.created_at ? new Date(row.created_at).getTime() : 0,
  }));

  return {
    reports,
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
    // Allow cache bypass with ?refresh=true
    const bypass = req.query.refresh === "true";
    const data = await cacheWithExpiry(
      REPORTS_CACHE_KEY,
      REPORTS_CACHE_TTL_SECONDS,
      fetchReports,
      bypass
    );
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching field reports:", error);
    return res.status(500).json({
      error: "Failed to fetch field reports",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
