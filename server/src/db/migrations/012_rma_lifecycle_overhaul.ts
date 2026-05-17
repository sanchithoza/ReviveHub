import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("replacements");

  await knex.schema.alterTable("return_transactions", (table) => {
    table.renameColumn("inward_serial", "old_serial_number");
    table.string("new_serial_number");
    table.renameColumn("inward_date", "received_from_customer_date");
    table.timestamp("sent_to_company_date");
    table.timestamp("received_from_company_date");
    table.timestamp("sent_to_customer_date");
  });

  await knex("return_transactions").where("status", "pending").update({ status: "received_from_customer" });
  await knex("return_transactions").where("status", "received").update({ status: "sent_to_company" });
  await knex("return_transactions").where("status", "inspected").update({ status: "received_from_company" });
}

export async function down(knex: Knex): Promise<void> {
  await knex("return_transactions").where("status", "received_from_customer").update({ status: "pending" });
  await knex("return_transactions").where("status", "sent_to_company").update({ status: "received" });
  await knex("return_transactions").where("status", "received_from_company").update({ status: "inspected" });

  await knex.schema.alterTable("return_transactions", (table) => {
    table.dropColumn("sent_to_customer_date");
    table.dropColumn("received_from_company_date");
    table.dropColumn("sent_to_company_date");
    table.dropColumn("new_serial_number");
    table.renameColumn("received_from_customer_date", "inward_date");
    table.renameColumn("old_serial_number", "inward_serial");
  });

  await knex.schema.createTableIfNotExists("replacements", (table) => {
    table.increments("id").primary();
    table.integer("customer_id").unsigned().notNullable().references("id").inTable("customers");
    table.integer("product_id").unsigned().notNullable().references("id").inTable("products");
    table.string("outward_serial");
    table.text("reason");
    table.string("status").defaultTo("pending");
    table.timestamp("outward_date").nullable();
    table.timestamp("inward_date").nullable();
    table.text("notes");
    table.string("contact_person");
    table.string("communication_channel");
    table.text("communication_notes");
    table.timestamps(true, true);
  });
}
