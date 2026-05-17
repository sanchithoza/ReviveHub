import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("return_transactions", (table) => {
    table.increments("id").primary();
    table.integer("customer_id").unsigned().notNullable().references("id").inTable("customers");
    table.integer("product_id").unsigned().notNullable().references("id").inTable("products");
    table.string("inward_serial");
    table.string("outward_serial");
    table.string("type").notNullable();
    table.text("reason");
    table.string("status").defaultTo("pending");
    table.timestamp("inward_date").defaultTo(knex.fn.now());
    table.timestamp("outward_date").nullable();
    table.text("notes");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("return_transactions");
}
