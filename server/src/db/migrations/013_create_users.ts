import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("username").notNullable().unique();
    table.string("email").unique();
    table.string("password_hash").notNullable();
    table.string("role").notNullable().defaultTo("viewer");
    table.boolean("view_only").notNullable().defaultTo(false);
    table.integer("customer_id").references("id").inTable("customers").onDelete("SET NULL");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("users");
}
