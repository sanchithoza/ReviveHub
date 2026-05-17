import path from "path";
import type { Knex } from "knex";

const databasePath = process.env.DATABASE_PATH || path.resolve(__dirname, "../../data.db");

const config: Knex.Config = {
  client: "better-sqlite3",
  connection: {
    filename: databasePath,
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.resolve(__dirname, "migrations"),
    extension: "ts",
  },
  seeds: {
    directory: path.resolve(__dirname, "seeds"),
    extension: "ts",
  },
};

export default config;
