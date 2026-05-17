import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("products", (table) => {
    table.integer("company_id").unsigned().references("id").inTable("companies");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("products", (table) => {
    table.dropColumn("company_id");
  });
}
