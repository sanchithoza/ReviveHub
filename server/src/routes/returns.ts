import { FastifyInstance } from "fastify";
import db from "../db";
import { authenticate, authorize, checkViewOnly } from "../middleware/auth";

export default async function returnRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/api/returns",
    { preHandler: [authenticate, authorize("admin", "operator", "viewer")] },
    async (request) => {
      const user = request.user!;
      let query = db("return_transactions")
        .leftJoin("customers", "return_transactions.customer_id", "customers.id")
        .leftJoin("products", "return_transactions.product_id", "products.id")
        .leftJoin("companies", "products.company_id", "companies.id")
        .select(
          "return_transactions.*",
          "customers.name as customer_name",
          "products.name as product_name",
          "companies.name as company_name"
        );

      if (user.role === "viewer" && user.customer_id) {
        query = query.where("return_transactions.customer_id", user.customer_id);
      }

      return query.orderBy("return_transactions.created_at", "desc");
    }
  );

  fastify.get(
    "/api/returns/:id",
    { preHandler: [authenticate, authorize("admin", "operator", "viewer")] },
    async (request) => {
      const { id } = request.params as { id: string };
      const returnTransaction = await db("return_transactions")
        .leftJoin("customers", "return_transactions.customer_id", "customers.id")
        .leftJoin("products", "return_transactions.product_id", "products.id")
        .leftJoin("companies", "products.company_id", "companies.id")
        .select(
          "return_transactions.*",
          "customers.name as customer_name",
          "customers.email as customer_email",
          "customers.phone as customer_phone",
          "products.name as product_name",
          "products.model as product_model",
          "companies.name as company_name"
        )
        .where("return_transactions.id", id)
        .first();
      if (!returnTransaction) throw { statusCode: 404, message: "Return transaction not found" };
      return returnTransaction;
    }
  );

  fastify.post(
    "/api/returns",
    { preHandler: [authenticate, authorize("admin", "operator"), checkViewOnly] },
    async (request) => {
      const body = request.body as {
        customer_id: number;
        product_id: number;
        old_serial_number?: string;
        reason?: string;
        notes?: string;
        contact_person?: string;
        communication_channel?: string;
        communication_notes?: string;
      };
      const insertData: Record<string, unknown> = {
        customer_id: body.customer_id,
        product_id: body.product_id,
        status: "received_from_customer",
        received_from_customer_date: db.fn.now(),
      };
      if (body.old_serial_number) {
        insertData.old_serial_number = body.old_serial_number;
      }
      if (body.reason) {
        insertData.reason = body.reason;
      }
      if (body.notes) {
        insertData.notes = body.notes;
      }
      if (body.contact_person) {
        insertData.contact_person = body.contact_person;
      }
      if (body.communication_channel) {
        insertData.communication_channel = body.communication_channel;
      }
      if (body.communication_notes) {
        insertData.communication_notes = body.communication_notes;
      }
      const [id] = await db("return_transactions").insert(insertData);
      return db("return_transactions").where("id", id).first();
    }
  );

  fastify.patch(
    "/api/returns/:id/send-to-company",
    { preHandler: [authenticate, authorize("admin", "operator"), checkViewOnly] },
    async (request) => {
      const { id } = request.params as { id: string };
      await db("return_transactions").where("id", id).update({ status: "sent_to_company", sent_to_company_date: db.fn.now() });
      return db("return_transactions").where("id", id).first();
    }
  );

  fastify.patch(
    "/api/returns/:id/receive-from-company",
    { preHandler: [authenticate, authorize("admin", "operator"), checkViewOnly] },
    async (request) => {
      const { id } = request.params as { id: string };
      const body = request.body as { new_serial_number?: string } | undefined;
      const updateData: Record<string, unknown> = {
        status: "received_from_company",
        received_from_company_date: db.fn.now(),
      };
      if (body?.new_serial_number) {
        updateData.new_serial_number = body.new_serial_number;
      }
      await db("return_transactions").where("id", id).update(updateData);
      return db("return_transactions").where("id", id).first();
    }
  );

  fastify.patch(
    "/api/returns/:id/complete",
    { preHandler: [authenticate, authorize("admin", "operator"), checkViewOnly] },
    async (request) => {
      const { id } = request.params as { id: string };
      await db("return_transactions").where("id", id).update({ status: "completed", sent_to_customer_date: db.fn.now() });
      return db("return_transactions").where("id", id).first();
    }
  );
}
