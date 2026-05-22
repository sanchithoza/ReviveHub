import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import db from "../db";
import { authenticate, authorize, checkViewOnly, JwtUserPayload } from "../middleware/auth";

function excludePassword(user: Record<string, unknown>) {
  const { password_hash, ...rest } = user;
  return rest;
}

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/api/auth/login", async (request, reply) => {
    const { username, password } = request.body as { username: string; password: string };
    if (!username || !password) {
      reply.status(400).send({ error: "Username and password are required" });
      return;
    }

    const user = await db("users").where("username", username).first();
    if (!user) {
      reply.status(401).send({ error: "Invalid credentials" });
      return;
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      reply.status(401).send({ error: "Invalid credentials" });
      return;
    }

    const payload: JwtUserPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      view_only: Boolean(user.view_only),
      customer_id: user.customer_id ?? null,
    };

    const token = fastify.jwt.sign(payload, { expiresIn: "7d" });

    return {
      token,
      user: excludePassword(user),
    };
  });

  fastify.post(
    "/api/auth/register",
    { preHandler: [authenticate, authorize("admin"), checkViewOnly] },
    async (request, reply) => {
      const body = request.body as {
        username: string;
        password: string;
        email?: string;
        role?: string;
        view_only?: boolean;
        customer_id?: number | null;
      };

      if (!body.username || !body.password) {
        reply.status(400).send({ error: "Username and password are required" });
        return;
      }

      const existingUser = await db("users").where("username", body.username).first();
      if (existingUser) {
        reply.status(409).send({ error: "Username already exists" });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(body.password, salt);

      const [id] = await db("users").insert({
        username: body.username,
        email: body.email || null,
        password_hash,
        role: body.role || "viewer",
        view_only: body.view_only ?? false,
        customer_id: body.customer_id ?? null,
      });

      const newUser = await db("users").where("id", id).first();
      return excludePassword(newUser);
    }
  );

  fastify.get(
    "/api/auth/me",
    { preHandler: [authenticate] },
    async (request) => {
      const user = await db("users").where("id", request.user!.id).first();
      if (!user) {
        throw { statusCode: 404, message: "User not found" };
      }
      return excludePassword(user);
    }
  );

  fastify.get(
    "/api/auth/users",
    { preHandler: [authenticate, authorize("admin")] },
    async () => {
      const users = await db("users").orderBy("created_at", "desc");
      return users.map((user) => excludePassword(user));
    }
  );

  fastify.put(
    "/api/auth/users/:id",
    { preHandler: [authenticate, authorize("admin"), checkViewOnly] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as {
        username?: string;
        email?: string;
        password?: string;
        role?: string;
        view_only?: boolean;
        customer_id?: number | null;
      };

      const updateData: Record<string, unknown> = {};
      if (body.username) updateData.username = body.username;
      if (body.email !== undefined) updateData.email = body.email;
      if (body.role) updateData.role = body.role;
      if (body.view_only !== undefined) updateData.view_only = body.view_only;
      if (body.customer_id !== undefined) updateData.customer_id = body.customer_id;

      if (body.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password_hash = await bcrypt.hash(body.password, salt);
      }

      await db("users").where("id", id).update(updateData);
      const updatedUser = await db("users").where("id", id).first();
      if (!updatedUser) {
        reply.status(404).send({ error: "User not found" });
        return;
      }
      return excludePassword(updatedUser);
    }
  );

  fastify.delete(
    "/api/auth/users/:id",
    { preHandler: [authenticate, authorize("admin"), checkViewOnly] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = await db("users").where("id", id).first();
      if (!user) {
        reply.status(404).send({ error: "User not found" });
        return;
      }
      if (user.username === "admin") {
        reply.status(403).send({ error: "The default admin user cannot be deleted" });
        return;
      }
      await db("users").where("id", id).del();
      return { success: true };
    }
  );
}
