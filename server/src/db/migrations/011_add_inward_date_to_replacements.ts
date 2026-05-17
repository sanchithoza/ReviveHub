import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("replacements", (table) => {
    table.timestamp("inward_date");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("replacements", (table) => {
    table.dropColumn("inward_date");
  });
}
