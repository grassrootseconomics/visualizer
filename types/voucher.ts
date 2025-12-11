/**
 * Voucher/token types from the blockchain
 */

export interface Voucher {
  id: number;
  contract_address: string;
  removed: boolean;
  sink_address: string;
  token_name: string;
  token_symbol: string;
  token_decimals: number;
}

export interface Transaction {
  tx_type: string;
  id: number;
  contract_address: string;
  tx_hash: string;
  block_number: number;
  tx_index: number;
  sender_address: string;
  recipient_address: string;
  tx_value: string;
  date_block: Date;
  success: boolean;
}

export interface NetworkData {
  vouchers: Voucher[];
  transactions: Transaction[];
}
