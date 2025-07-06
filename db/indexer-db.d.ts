import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Numeric = ColumnType<string, string | number, string | number>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface FaucetGive {
  id: Generated<number>;
  tx_id: number | null;
  token_address: string;
  recipient_address: string;
  contract_address: Generated<string>;
  give_value: Numeric;
}

export interface OwnershipChange {
  id: Generated<number>;
  tx_id: number | null;
  previous_owner: Generated<string>;
  new_owner: Generated<string>;
  contract_address: Generated<string>;
}

export interface PoolDeposit {
  id: Generated<number>;
  tx_id: number | null;
  initiator_address: string;
  token_in_address: string;
  contract_address: Generated<string>;
  in_value: Numeric;
}

export interface Pools {
  id: Generated<number>;
  contract_address: Generated<string>;
  pool_name: string;
  pool_symbol: string;
  removed: Generated<boolean>;
}

export interface PoolSwap {
  id: Generated<number>;
  tx_id: number | null;
  initiator_address: string;
  token_in_address: string;
  token_out_address: string;
  in_value: Numeric;
  out_value: Numeric;
  contract_address: Generated<string>;
  fee: Numeric;
}

export interface SchemaVersion {
  version: number;
}

export interface TokenBurn {
  id: Generated<number>;
  tx_id: number | null;
  burner_address: string;
  contract_address: Generated<string>;
  burn_value: Numeric;
}

export interface TokenMint {
  id: Generated<number>;
  tx_id: number | null;
  minter_address: string;
  recipient_address: string;
  contract_address: Generated<string>;
  mint_value: Numeric;
}

export interface Tokens {
  id: Generated<number>;
  contract_address: Generated<string>;
  token_name: string;
  token_symbol: string;
  token_decimals: number;
  sink_address: Generated<string>;
  removed: Generated<boolean>;
}

export interface TokenTransfer {
  id: Generated<number>;
  tx_id: number | null;
  sender_address: string;
  recipient_address: string;
  contract_address: Generated<string>;
  transfer_value: Numeric;
}

export interface Tx {
  id: Generated<number>;
  tx_hash: string;
  block_number: number;
  date_block: Timestamp;
  success: boolean;
}

export interface DB {
  faucet_give: FaucetGive;
  ownership_change: OwnershipChange;
  pool_deposit: PoolDeposit;
  pool_swap: PoolSwap;
  pools: Pools;
  schema_version: SchemaVersion;
  token_burn: TokenBurn;
  token_mint: TokenMint;
  token_transfer: TokenTransfer;
  tokens: Tokens;
  tx: Tx;
}
