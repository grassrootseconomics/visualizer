/**
 * Pool type definitions
 */

export interface Pool {
  pool_address: string;
  pool_name: string;
  pool_symbol: string;
  owner_address: string;
  allowed_tokens: string[];
}

export interface PoolsResponse {
  pools: Pool[];
  lastUpdate: number;
}
