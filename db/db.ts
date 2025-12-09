import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { type DB as FederatedDB } from "./federated-db";
import { type DB as GraphDB } from "./graph-db";

const globalForDatabases = globalThis as unknown as {
  graphDB: Kysely<GraphDB> | undefined;
  federatedDB: Kysely<FederatedDB> | undefined;
};
export type { FederatedDB, GraphDB };
export const graphDB =
  globalForDatabases.graphDB ??
  new Kysely<GraphDB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: process.env.DATABASE_URL,
        idleTimeoutMillis: 10000,
      }),
    }),
  });
export const federatedDB =
  globalForDatabases.federatedDB ??
  new Kysely<FederatedDB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: process.env.FEDERATED_DB_URL,
      }),
    }),
    // log: env.NODE_ENV !== "production" ? ["query"] : undefined,
  });
globalForDatabases.graphDB = graphDB;
globalForDatabases.federatedDB = federatedDB;
