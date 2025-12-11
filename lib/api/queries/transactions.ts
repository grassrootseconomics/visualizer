/**
 * Transaction database queries
 */

import { federatedDB } from "@db/db";
import { FAUCET_ADDRESS, ONE_YEAR_MS } from "@/config/constants";

/**
 * Fetch transactions from the database
 * Filters out faucet transactions and only includes successful ones from the last year
 */
export function fetchTransactions() {
  return federatedDB
    .selectFrom("chain_data.token_transfer")
    .innerJoin(
      "chain_data.tx",
      "chain_data.token_transfer.tx_id",
      "chain_data.tx.id"
    )
    .select([
      "chain_data.tx.id",
      "chain_data.token_transfer.sender_address",
      "chain_data.token_transfer.recipient_address",
      "chain_data.token_transfer.contract_address",
      "chain_data.token_transfer.transfer_value as tx_value",
      "chain_data.tx.date_block",
      "chain_data.tx.success",
      "chain_data.tx.tx_hash",
      "chain_data.tx.block_number",
    ])
    .where("chain_data.tx.success", "=", true)
    .where("chain_data.token_transfer.sender_address", "!=", FAUCET_ADDRESS)
    .where("chain_data.token_transfer.recipient_address", "!=", FAUCET_ADDRESS)
    .where(
      "chain_data.tx.date_block",
      ">=",
      new Date(Date.now() - ONE_YEAR_MS)
    )
    .execute();
}

export type TransactionRow = Awaited<ReturnType<typeof fetchTransactions>>[0];
