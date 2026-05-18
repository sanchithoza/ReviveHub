import { FastifyRequest, FastifyReply } from "fastify";

export interface JwtUserPayload {
  id: number;
  username: string;
  role: string;
  view_only: boolean;
  customer_id: number | null;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: JwtUserPayload;
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    reply.status(401).send({ error: "Unauthorized" });
  }
}

export function authorize(...allowedRoles: string[]) {
  return async function (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const user = request.user;
    if (!user) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      reply.status(403).send({ error: "Forbidden: insufficient role" });
      return;
    }
  };
}

export async function checkViewOnly(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const user = request.user;
  if (!user) {
    reply.status(401).send({ error: "Unauthorized" });
    return;
  }
  if (user.view_only) {
    reply.status(403).send({ error: "Forbidden: account is view-only" });
    return;
  }
}
