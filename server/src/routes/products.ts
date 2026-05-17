import { FastifyInstance } from "fastify";
import db from "../db";

export default async function productRoutes(fastify: FastifyInstance) {
  fastify.get("/api/products", async () => {
    return db("products")
      .leftJoin("companies", "products.company_id", "companies.id")
      .select(
        "products.*",
        "companies.name as company_name"
      )
      .orderBy("products.created_at", "desc");
  });

  fastify.get("/api/products/:id", async (request) => {
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
  });

  fastify.post("/api/products", async (request) => {
    const body = request.body as { name: string; company_id: number; model?: string; description?: string };
    const [id] = await db("products").insert(body);
    return db("products").where("id", id).first();
  });

  fastify.put("/api/products/:id", async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as { name?: string; company_id?: number; model?: string; description?: string };
    await db("products").where("id", id).update(body);
    return db("products").where("id", id).first();
  });

  fastify.delete("/api/products/:id", async (request) => {
    const { id } = request.params as { id: string };
    await db("products").where("id", id).del();
    return { success: true };
  });
}
