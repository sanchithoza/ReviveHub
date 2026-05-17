import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("return_transactions", (table) => {
    table.dropColumn("type");
    table.dropColumn("outward_serial");
    table.dropColumn("outward_date");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("return_transactions", (table) => {
    table.string("type").notNullable().defaultTo("return");
    table.string("outward_serial");
    table.timestamp("outward_date").nullable();
  });
}
