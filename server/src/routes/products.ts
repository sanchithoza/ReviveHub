import { FastifyInstance } from "fastify";
import db from "../db";
import { authenticate, authorize, checkViewOnly } from "../middleware/auth";

export default async function productRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/api/products",
    { preHandler: [authenticate, authorize("admin", "operator", "viewer")] },
    async () => {
      return db("products")
        .leftJoin("companies", "products.company_id", "companies.id")
        .select(
          "products.*",
          "companies.name as company_name"
        )
        .orderBy("products.created_at", "desc");
    }
  );

  fastify.get(
    "/api/products/:id",
    { preHandler: [authenticate, authorize("admin", "operator", "viewer")] },
    async (request) => {
      const { id } = request.params as { id: string };
      const product = await db("products")
        .leftJoin("companies", "products.company_id", "companies.id")
        .select(
          "products.*",
          "companies.name as company_name"
        )
        .where("products.id", id)
        .first();
      if (!product) throw { statusCode: 404, message: "Product not found" };
      return product;
    }
  );

  fastify.post(
    "/api/products",
    { preHandler: [authenticate, authorize("admin", "operator"), checkViewOnly] },
    async (request, reply) => {
      const body = request.body as { name?: string; company_id?: number; model?: string; description?: string };
      if (!body.name || body.name.trim() === "") {
        reply.status(400).send({ error: "Product name is required" });
        return;
      }
      if (!body.company_id) {
        reply.status(400).send({ error: "Company is required" });
        return;
      }
      const [id] = await db("products").insert({
        name: body.name.trim(),
        company_id: body.company_id,
        model: body.model?.trim() || null,
        description: body.description?.trim() || null,
      });
      return db("products").where("id", id).first();
    }
  );

  fastify.put(
    "/api/products/:id",
    { preHandler: [authenticate, authorize("admin", "operator"), checkViewOnly] },
    async (request) => {
      const { id } = request.params as { id: string };
      const body = request.body as { name?: string; company_id?: number; model?: string; description?: string };
      await db("products").where("id", id).update(body);
      return db("products").where("id", id).first();
    }
  );

  fastify.delete(
    "/api/products/:id",
    { preHandler: [authenticate, authorize("admin", "operator"), checkViewOnly] },
    async (request) => {
      const { id } = request.params as { id: string };
      await db("products").where("id", id).del();
      return { success: true };
    }
  );
}
