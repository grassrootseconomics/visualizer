/**
 * API request/response types
 */

import type { GraphData } from "./graph";
import type { Voucher } from "./voucher";

export interface DataResponse {
  graphData: GraphData;
  vouchers: Voucher[];
  lastUpdate: number;
}
