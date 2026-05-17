import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("replacements", (table) => {
    table.increments("id").primary();
    table.integer("customer_id").unsigned().notNullable().references("id").inTable("customers");
    table.integer("product_id").unsigned().notNullable().references("id").inTable("products");
    table.string("outward_serial");
    table.text("reason");
    table.string("status").defaultTo("pending");
    table.timestamp("outward_date").nullable();
    table.text("notes");
    table.string("contact_person");
    table.string("communication_channel");
    table.text("communication_notes");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("replacements");
}
