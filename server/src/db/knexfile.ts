import path from "path";
import type { Knex } from "knex";

const config: Knex.Config = {
  client: "better-sqlite3",
  connection: {
    filename: path.resolve(__dirname, "../../data.db"),
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
