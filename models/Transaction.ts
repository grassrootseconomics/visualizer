export type Transaction = {
  block_number: number;
  date_block: number;
  destination_token: string;
  from_value: number;
  recipient: string;
  sender: string;
  source_token: string;
  success: true;
  to_value: number;
  tx_hash: string;
  tx_index: number;
  tx_type: string;
};
