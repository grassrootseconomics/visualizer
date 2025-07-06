import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Json = ColumnType<JsonValue, string, string>;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | null | number | string;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Point = {
  x: number;
  y: number;
};

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface AccountRoleType {
  value: string;
}

export interface Accounts {
  id: Generated<number>;
  user_identifier: number;
  account_type: string;
  blockchain_address: string;
  created_at: Generated<Timestamp>;
  account_role: Generated<string>;
  gas_gift_status: Generated<string>;
  gas_approver: number | null;
  default_voucher: string | null;
}

export interface AccountType {
  value: string;
}

export interface CommodityType {
  value: string;
}

export interface FieldReports {
  id: Generated<number>;
  title: string;
  report: string;
  description: string;
  vouchers: string[];
  image_url: string | null;
  tags: string[] | null;
  location: string | null;
  period_from: Timestamp | null;
  period_to: Timestamp | null;
  created_by: number;
  modified_by: number;
  verified_by: number[] | null;
  status: Generated<string>;
  rejection_reason: string | null;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface FieldReportStatusType {
  value: string;
}

export interface GasGiftStatusType {
  value: string;
}

export interface GenderType {
  value: string;
}

export interface HdbCatalogHdbActionLog {
  id: Generated<string>;
  action_name: string | null;
  input_payload: Json;
  request_headers: Json;
  session_variables: Json;
  response_payload: Json | null;
  errors: Json | null;
  created_at: Generated<Timestamp>;
  response_received_at: Timestamp | null;
  status: string;
}

export interface HdbCatalogHdbCronEventInvocationLogs {
  id: Generated<string>;
  event_id: string | null;
  status: number | null;
  request: Json | null;
  response: Json | null;
  created_at: Generated<Timestamp | null>;
}

export interface HdbCatalogHdbCronEvents {
  id: Generated<string>;
  trigger_name: string;
  scheduled_time: Timestamp;
  status: Generated<string>;
  tries: Generated<number>;
  created_at: Generated<Timestamp | null>;
  next_retry_at: Timestamp | null;
}

export interface HdbCatalogHdbMetadata {
  id: number;
  metadata: Json;
  resource_version: Generated<number>;
}

export interface HdbCatalogHdbScheduledEventInvocationLogs {
  id: Generated<string>;
  event_id: string | null;
  status: number | null;
  request: Json | null;
  response: Json | null;
  created_at: Generated<Timestamp | null>;
}

export interface HdbCatalogHdbScheduledEvents {
  id: Generated<string>;
  webhook_conf: Json;
  scheduled_time: Timestamp;
  retry_conf: Json | null;
  payload: Json | null;
  header_conf: Json | null;
  status: Generated<string>;
  tries: Generated<number>;
  created_at: Generated<Timestamp | null>;
  next_retry_at: Timestamp | null;
  comment: string | null;
}

export interface HdbCatalogHdbSchemaNotifications {
  id: number;
  notification: Json;
  resource_version: Generated<number>;
  instance_id: string;
  updated_at: Generated<Timestamp | null>;
}

export interface HdbCatalogHdbVersion {
  hasura_uuid: Generated<string>;
  version: string;
  upgraded_on: Timestamp;
  cli_state: Generated<Json>;
  console_state: Generated<Json>;
}

export interface InterfaceType {
  value: string;
}

export interface PersonalInformation {
  user_identifier: number;
  year_of_birth: number | null;
  gender: string | null;
  family_name: string | null;
  given_names: string | null;
  location_name: string | null;
  geo: Point | null;
  language_code: Generated<string | null>;
  id: Generated<number>;
}

export interface ProductListings {
  id: number;
  voucher: number;
  account: number;
  commodity_name: string;
  quantity: number;
  frequency: string;
  commodity_type: string;
  commodity_description: string;
  commodity_available: Generated<boolean | null>;
  location_name: string;
  geo: Point | null;
  created_at: Generated<Timestamp>;
  price: Generated<number | null>;
  image_url: string | null;
}

export interface SchemaVersion {
  version: number;
}

export interface ServiceType {
  value: string;
}

export interface SwapPools {
  id: Generated<number>;
  pool_address: string;
  swap_pool_description: string;
  banner_url: string | null;
  custom_terms_and_conditions: string | null;
}

export interface SwapPoolTags {
  id: Generated<number>;
  swap_pool: number;
  tag: number;
}

export interface Tags {
  id: Generated<number>;
  tag: string;
}

export interface TxType {
  value: string;
}

export interface Users {
  id: Generated<number>;
  interface_type: string;
  interface_identifier: string;
  activated: Generated<boolean | null>;
  created_at: Generated<Timestamp>;
}

export interface VoucherIssuers {
  id: number;
  voucher: number;
  backer: number;
  active: Generated<boolean | null>;
  created_at: Generated<Timestamp>;
}

export interface Vouchers {
  id: Generated<number>;
  voucher_address: string;
  symbol: string;
  voucher_name: string;
  voucher_description: string;
  sink_address: string;
  active: Generated<boolean | null>;
  location_name: string | null;
  geo: Point | null;
  created_at: Generated<Timestamp>;
  radius: number | null;
  internal: Generated<boolean | null>;
  voucher_email: string | null;
  voucher_website: string | null;
  voucher_uoa: Generated<string>;
  voucher_value: Generated<number>;
  voucher_type: Generated<string>;
  contract_version: string | null;
  icon_url: string | null;
  banner_url: string | null;
  custom_terms_and_conditions: string | null;
}

export interface VoucherType {
  value: string;
}

export interface DB {
  account_role_type: AccountRoleType;
  account_type: AccountType;
  accounts: Accounts;
  commodity_type: CommodityType;
  field_report_status_type: FieldReportStatusType;
  field_reports: FieldReports;
  gas_gift_status_type: GasGiftStatusType;
  gender_type: GenderType;
  "hdb_catalog.hdb_action_log": HdbCatalogHdbActionLog;
  "hdb_catalog.hdb_cron_event_invocation_logs": HdbCatalogHdbCronEventInvocationLogs;
  "hdb_catalog.hdb_cron_events": HdbCatalogHdbCronEvents;
  "hdb_catalog.hdb_metadata": HdbCatalogHdbMetadata;
  "hdb_catalog.hdb_scheduled_event_invocation_logs": HdbCatalogHdbScheduledEventInvocationLogs;
  "hdb_catalog.hdb_scheduled_events": HdbCatalogHdbScheduledEvents;
  "hdb_catalog.hdb_schema_notifications": HdbCatalogHdbSchemaNotifications;
  "hdb_catalog.hdb_version": HdbCatalogHdbVersion;
  interface_type: InterfaceType;
  personal_information: PersonalInformation;
  product_listings: ProductListings;
  schema_version: SchemaVersion;
  service_type: ServiceType;
  swap_pool_tags: SwapPoolTags;
  swap_pools: SwapPools;
  tags: Tags;
  tx_type: TxType;
  users: Users;
  voucher_issuers: VoucherIssuers;
  voucher_type: VoucherType;
  vouchers: Vouchers;
}
