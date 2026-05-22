import { FastifyInstance } from "fastify";
import db from "../db";
import { authenticate, authorize, checkViewOnly } from "../middleware/auth";

export default async function companyRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/api/companies",
    { preHandler: [authenticate, authorize("admin", "operator", "viewer")] },
    async () => {
      return db("companies").orderBy("created_at", "desc");
    }
  );

  fastify.get(
    "/api/companies/:id",
    { preHandler: [authenticate, authorize("admin", "operator", "viewer")] },
    async (request) => {
      const { id } = request.params as { id: string };
      const company = await db("companies").where("id", id).first();
      if (!company) throw { statusCode: 404, message: "Company not found" };
      return company;
    }
  );

  fastify.post(
    "/api/companies",
    { preHandler: [authenticate, authorize("admin", "operator"), checkViewOnly] },
    async (request, reply) => {
      const body = request.body as { name?: string; email?: string; phone?: string; address?: string };
      if (!body.name || body.name.trim() === "") {
        reply.status(400).send({ error: "Company name is required" });
        return;
      }
      const [id] = await db("companies").insert({
        name: body.name.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        address: body.address?.trim() || null,
      });
      return db("companies").where("id", id).first();
    }
  );

  fastify.put(
    "/api/companies/:id",
    { preHandler: [authenticate, authorize("admin", "operator"), checkViewOnly] },
    async (request) => {
      const { id } = request.params as { id: string };
      const body = request.body as { name?: string; email?: string; phone?: string; address?: string };
      await db("companies").where("id", id).update(body);
      return db("companies").where("id", id).first();
    }
  );

  fastify.delete(
    "/api/companies/:id",
    { preHandler: [authenticate, authorize("admin", "operator"), checkViewOnly] },
    async (request) => {
      const { id } = request.params as { id: string };
      await db("companies").where("id", id).del();
      return { success: true };
    }
  );
}
