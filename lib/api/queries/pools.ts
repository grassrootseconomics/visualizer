/**
 * Pool database queries
 */

import { federatedDB } from "@db/db";

/**
 * Fetch all swap pools with their allowed tokens
 */
export async function fetchPools() {
  // Fetch all swap pools
  const pools = await federatedDB
    .selectFrom("pool_router.swap_pools")
    .select([
      "pool_address",
      "pool_name",
      "pool_symbol",
      "owner_address",
    ])
    .execute();

  // Fetch all allowed tokens
  const allowedTokens = await federatedDB
    .selectFrom("pool_router.pool_allowed_tokens")
    .select(["pool_address", "token_address"])
    .execute();

  // Group allowed tokens by pool address
  const tokensByPool = new Map<string, string[]>();
  for (const row of allowedTokens) {
    const existing = tokensByPool.get(row.pool_address) ?? [];
    existing.push(row.token_address);
    tokensByPool.set(row.pool_address, existing);
  }

  // Combine pools with their allowed tokens
  return pools.map((pool) => ({
    pool_address: pool.pool_address,
    pool_name: pool.pool_name,
    pool_symbol: pool.pool_symbol,
    owner_address: pool.owner_address,
    allowed_tokens: tokensByPool.get(pool.pool_address) ?? [],
  }));
}

export type PoolRow = Awaited<ReturnType<typeof fetchPools>>[0];
