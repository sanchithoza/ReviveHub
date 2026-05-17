import { FastifyInstance } from "fastify";
import db from "../db";

export default async function companyRoutes(fastify: FastifyInstance) {
  fastify.get("/api/companies", async () => {
    return db("companies").orderBy("created_at", "desc");
  });

  fastify.get("/api/companies/:id", async (request) => {
    const { id } = request.params as { id: string };
    const company = await db("companies").where("id", id).first();
    if (!company) throw { statusCode: 404, message: "Company not found" };
    return company;
  });

  fastify.post("/api/companies", async (request) => {
    const body = request.body as { name: string; email?: string; phone?: string; address?: string };
    const [id] = await db("companies").insert(body);
    return db("companies").where("id", id).first();
  });

  fastify.put("/api/companies/:id", async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as { name?: string; email?: string; phone?: string; address?: string };
    await db("companies").where("id", id).update(body);
    return db("companies").where("id", id).first();
  });

  fastify.delete("/api/companies/:id", async (request) => {
    const { id } = request.params as { id: string };
    await db("companies").where("id", id).del();
    return { success: true };
  });
}
