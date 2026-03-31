/**
 * Geographic data database queries
 */

import { federatedDB } from "@db/db";
import { ONE_YEAR_MS } from "@/config/constants";

/**
 * Fetch account locations by joining accounts with personal_information
 */
export function fetchAccountGeoLocations() {
  return federatedDB
    .selectFrom("sarafu_network.accounts")
    .innerJoin(
      "sarafu_network.personal_information",
      "sarafu_network.accounts.user_identifier",
      "sarafu_network.personal_information.user_identifier"
    )
    .select([
      "sarafu_network.accounts.blockchain_address",
      "sarafu_network.personal_information.geo",
      "sarafu_network.personal_information.location_name",
      "sarafu_network.personal_information.given_names",
      "sarafu_network.personal_information.family_name",
    ])
    .where("sarafu_network.personal_information.geo", "is not", null)
    .execute();
}

export type AccountGeoRow = Awaited<
  ReturnType<typeof fetchAccountGeoLocations>
>[0];

/**
 * Fetch voucher locations from sarafu_network.vouchers
 */
export function fetchVoucherGeoLocations() {
  return federatedDB
    .selectFrom("sarafu_network.vouchers")
    .select([
      "voucher_address",
      "geo",
      "location_name",
      "voucher_name",
      "symbol",
      "radius",
      "voucher_value",
    ])
    .where("geo", "is not", null)
    .where("active", "=", true)
    .execute();
}

export type VoucherGeoRow = Awaited<
  ReturnType<typeof fetchVoucherGeoLocations>
>[0];

/**
 * Fetch pool swap transactions for the last year
 */
export function fetchPoolSwapTransactions() {
  return federatedDB
    .selectFrom("chain_data.pool_swap")
    .innerJoin("chain_data.tx", "chain_data.pool_swap.tx_id", "chain_data.tx.id")
    .select([
      "chain_data.pool_swap.contract_address",
      "chain_data.pool_swap.initiator_address",
      "chain_data.pool_swap.token_in_address",
      "chain_data.pool_swap.token_out_address",
      "chain_data.pool_swap.in_value",
      "chain_data.pool_swap.out_value",
      "chain_data.pool_swap.fee",
      "chain_data.tx.date_block",
      "chain_data.tx.tx_hash",
      "chain_data.tx.block_number",
      "chain_data.tx.success",
    ])
    .where("chain_data.tx.success", "=", true)
    .where(
      "chain_data.tx.date_block",
      ">=",
      new Date(Date.now() - ONE_YEAR_MS)
    )
    .execute();
}

export type PoolSwapRow = Awaited<
  ReturnType<typeof fetchPoolSwapTransactions>
>[0];
