import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { type DB as GraphDB } from "./graph-db";
import { type DB as IndexerDB } from "./indexer-db";

const globalForDatabases = globalThis as unknown as {
  graphDB: Kysely<GraphDB> | undefined;
  indexerDB: Kysely<IndexerDB> | undefined;
};
export type { GraphDB, IndexerDB };
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
export const indexerDB =
  globalForDatabases.indexerDB ??
  new Kysely<IndexerDB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: process.env.INDEXER_DB_URL,
      }),
    }),
    // log: env.NODE_ENV !== "production" ? ["query"] : undefined,
  });
globalForDatabases.graphDB = graphDB;
globalForDatabases.indexerDB = indexerDB;
