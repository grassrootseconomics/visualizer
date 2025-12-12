/**
 * Field report types for timeline display
 */

export interface FieldReport {
  id: number;
  title: string;
  description: string;
  period_from: number; // Unix timestamp
  period_to: number | null; // Null means ongoing
  location: string | null;
  image_url: string | null;
  tags: string[] | null;
  vouchers: string[]; // Contract addresses
  created_at: number;
}

export interface FieldReportsResponse {
  reports: FieldReport[];
  lastUpdate: number;
}

export type ReportVisibility = "entering" | "visible" | "exiting";

export interface VisibleReport extends FieldReport {
  visibility: ReportVisibility;
}
