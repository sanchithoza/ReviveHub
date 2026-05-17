import Fastify from "fastify";
import cors from "@fastify/cors";
import companyRoutes from "./routes/companies";
import customerRoutes from "./routes/customers";
import productRoutes from "./routes/products";
import returnRoutes from "./routes/returns";

const server = Fastify({
  logger: true,
});

async function main() {
  await server.register(cors, {
    origin: true,
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
    await server.listen({ port: 3001 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
