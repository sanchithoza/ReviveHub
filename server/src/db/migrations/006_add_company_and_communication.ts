import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("customers", (table) => {
    table.integer("company_id").unsigned().nullable().references("id").inTable("companies");
  });

  await knex.schema.alterTable("return_transactions", (table) => {
    table.string("contact_person");
    table.string("communication_channel");
    table.text("communication_notes");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("return_transactions", (table) => {
    table.dropColumn("contact_person");
    table.dropColumn("communication_channel");
    table.dropColumn("communication_notes");
  });

  await knex.schema.alterTable("customers", (table) => {
    table.dropColumn("company_id");
  });
}
