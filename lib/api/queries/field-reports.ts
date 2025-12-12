/**
 * Field report database queries
 */

import { graphDB } from "@db/db";

/**
 * Fetch all approved field reports from the database
 */
export function fetchApprovedFieldReports() {
  return graphDB
    .selectFrom("field_reports")
    .select([
      "id",
      "title",
      "description",
      "period_from",
      "period_to",
      "location",
      "image_url",
      "tags",
      "vouchers",
      "created_at",
    ])
    .where("status", "=", "APPROVED")
    .where("period_from", ">=", new Date("10-12-2024"))
    .where("image_url", "is not", null)
    .orderBy("period_from", "asc")
    .execute();
}

export type FieldReportRow = Awaited<
  ReturnType<typeof fetchApprovedFieldReports>
>[0];
