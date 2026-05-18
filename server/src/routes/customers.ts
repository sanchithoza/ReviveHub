import { FastifyInstance } from "fastify";
import db from "../db";
import { authenticate, authorize, checkViewOnly } from "../middleware/auth";

export default async function customerRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/api/customers",
    { preHandler: [authenticate, authorize("admin", "operator", "viewer")] },
    async () => {
      return db("customers").orderBy("created_at", "desc");
    }
  );

  fastify.get(
    "/api/customers/:id",
    { preHandler: [authenticate, authorize("admin", "operator", "viewer")] },
    async (request) => {
      const { id } = request.params as { id: string };
      const customer = await db("customers").where("id", id).first();
      if (!customer) throw { statusCode: 404, message: "Customer not found" };
      return customer;
    }
  );

  fastify.post(
    "/api/customers",
    { preHandler: [authenticate, authorize("admin", "operator"), checkViewOnly] },
    async (request) => {
      const body = request.body as { name: string; email?: string; phone?: string; address?: string };
      const [id] = await db("customers").insert(body);
      return db("customers").where("id", id).first();
    }
  );

  fastify.put(
    "/api/customers/:id",
    { preHandler: [authenticate, authorize("admin", "operator"), checkViewOnly] },
    async (request) => {
      const { id } = request.params as { id: string };
      const body = request.body as { name?: string; email?: string; phone?: string; address?: string };
      await db("customers").where("id", id).update(body);
      return db("customers").where("id", id).first();
    }
  );

  fastify.delete(
    "/api/customers/:id",
    { preHandler: [authenticate, authorize("admin", "operator"), checkViewOnly] },
    async (request) => {
      const { id } = request.params as { id: string };
      await db("customers").where("id", id).del();
      return { success: true };
    }
  );
}
