/**
 * Voucher database queries
 */

import { federatedDB } from "@db/db";

/**
 * Fetch all vouchers/tokens from the database
 */
export function fetchVouchers() {
  return federatedDB.selectFrom("chain_data.tokens").selectAll().execute();
}

export type VoucherRow = Awaited<ReturnType<typeof fetchVouchers>>[0];
