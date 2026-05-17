import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import companyRoutes from "./routes/companies";
import customerRoutes from "./routes/customers";
import productRoutes from "./routes/products";
import returnRoutes from "./routes/returns";

const port = parseInt(process.env.PORT || "3001", 10);
const corsOrigin = process.env.CORS_ORIGIN || "true";

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

async function main() {
  await server.register(cors, {
    origin: resolveCorsOrigin(corsOrigin),
    methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH"],
  });

  server.get("/health", async () => {
    return { status: "ok" };
  });

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
