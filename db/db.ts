import { Kysely, PostgresDialect } from "kysely";
import { type DB } from "kysely-codegen";
import { Pool } from "pg";
import { PointPlugin } from "./plugins";

const globalForKysely = globalThis as unknown as {
  kysely: Kysely<DB> | undefined;
};

export const kysely =
  globalForKysely.kysely ??
  new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: process.env.DATABASE_URL,
      }),
    }),
    plugins: [new PointPlugin()],
  });

if (process.env.NODE_ENV !== "production") globalForKysely.kysely = kysely;
