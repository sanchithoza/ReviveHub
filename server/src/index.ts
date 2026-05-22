import "dotenv/config";
import Fastify, { FastifyError } from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import companyRoutes from "./routes/companies";
import customerRoutes from "./routes/customers";
import productRoutes from "./routes/products";
import returnRoutes from "./routes/returns";
import authRoutes from "./routes/auth";
import { authenticate } from "./middleware/auth";

const port = parseInt(process.env.PORT || "3001", 10);
const corsOrigin = process.env.CORS_ORIGIN || "true";
const jwtSecret = process.env.JWT_SECRET || "fallback_secret";

function resolveCorsOrigin(rawOrigin: string): boolean | string {
  if (rawOrigin === "true") {
    return true;
  }
  if (rawOrigin === "false") {
    return false;
  }
  return rawOrigin;
}

const server = Fastify({
  logger: true,
});

server.setErrorHandler<FastifyError>((error, request, reply) => {
  server.log.error(error);

  if (error.statusCode && error.statusCode < 500) {
    reply.status(error.statusCode).send({ error: error.message });
    return;
  }

  if (error.validation) {
    reply.status(400).send({ error: "Invalid request data" });
    return;
  }

  reply.status(500).send({ error: "An unexpected error occurred. Please try again later." });
});

async function main() {
  await server.register(cors, {
    origin: resolveCorsOrigin(corsOrigin),
    methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH"],
  });

  await server.register(jwt, { secret: jwtSecret });

  server.get("/health", async () => {
    return { status: "ok" };
  });

  await server.register(authRoutes);
  await server.register(companyRoutes);
  await server.register(customerRoutes);
  await server.register(productRoutes);
  await server.register(returnRoutes);

  try {
    await server.listen({ port });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
