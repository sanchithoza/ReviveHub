import type { Knex } from "knex";
import bcrypt from "bcryptjs";

export async function seed(knex: Knex): Promise<void> {
  await knex("users").del();

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("admin123", salt);

  await knex("users").insert({
    username: "admin",
    email: "admin@revivehub.com",
    password_hash: passwordHash,
    role: "admin",
    view_only: false,
    customer_id: null,
  });
}
