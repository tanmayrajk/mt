import Fastify from "fastify";
import formbody from "@fastify/formbody";
const fastify = Fastify({
  logger: true,
});
fastify.register(formbody);

import { db } from "./db";
import { users } from "./db/schema";

interface SlashCommandReqBody {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  api_app_id: string;
  is_enterprise_install: string;
  enterprise_id: string;
  enterprise_name: string;
  response_url: string;
  trigger_id: string;
}

fastify.post("/setapekey", async (req, res) => {
  const body = req.body as SlashCommandReqBody;

  await db
    .insert(users)
    .values({
      userId: body.user_id,
      apeKey: body.text,
    })
    .onConflictDoUpdate({
      target: users.userId,
      set: {
        apeKey: body.text,
      },
    });

  return {
    response_type: "ephemeral",
    text: "you're officially an ape now!",
  };
});

try {
  await fastify.listen({
    port: 3000,
  });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
