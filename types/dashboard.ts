/**
 * Dashboard-specific types
 */

export interface NodeInfoData {
  id: string;
  value: number;
  usedVouchers: Record<string, { firstTxDate: number; txCount: number }>;
}

export interface LinkInfoData {
  source: string;
  target: string;
  token_name: string;
  token_symbol: string;
  contract_address: string;
  txCount: number;
  value: number;
  date: number;
  dateFirst: number;
}

export type SelectedInfo =
  | { type: "node"; data: NodeInfoData }
  | { type: "link"; data: LinkInfoData }
  | null;

export interface ExpandedSections {
  pools: boolean;
  vouchers: boolean;
  animation: boolean;
  display: boolean;
  physics: boolean;
}
