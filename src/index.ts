import Fastify from "fastify";
import formbody from "@fastify/formbody";
const fastify = Fastify({
  logger: true,
});
fastify.register(formbody);

import { db } from "./db";
import { users } from "./db/schema";
import type { SlashCommandReqBody } from "./types/api";
import { eq } from "drizzle-orm";

import {
  createTextEl,
  createButtonEl,
  createTextOnlyMCQ,
  replyToInteraction,
  getNameFromLastTest,
} from "./utils";
import { JsxEmit } from "typescript";

fastify.post("/interactivity", async (req, res) => {
  const body = req.body as { payload: string };
  const payload = JSON.parse(body.payload);
  console.log(payload);

  if (payload.actions[0].action_id === "correct_username") {
    const userExists = !!(await db.query.users.findFirst({
      where: eq(users.userId, payload.user.id),
    }));
    if (userExists) {
      const q = createTextEl(
        "mrkdwn",
        `an apekey associated with this user already exists. do you want to replace it? 🤔`,
      );
      const choices = [
        createButtonEl("yep", "replace_apekey", payload.actions[0].value),
        createButtonEl("nope", "dont_replace_apekey", payload.actions[0].value),
      ];
      const mcq = createTextOnlyMCQ(q, choices);

      await replyToInteraction(
        payload.response_url,
        JSON.stringify({
          replace_original: true,
          text: "please use a normal slack client bruh",
          blocks: mcq.blocks,
        }),
      );
    } else {
      await db
        .insert(users)
        .values({
          userId: payload.user.id,
          apeKey: JSON.parse(payload.actions[0].value).apeKey,
          username: JSON.parse(payload.actions[0].value).username,
        })
        .onConflictDoUpdate({
          target: users.userId,
          set: {
            apeKey: JSON.parse(payload.actions[0].value).apeKey,
            username: JSON.parse(payload.actions[0].value).username,
          },
        });

      await replyToInteraction(
        payload.response_url,
        JSON.stringify({
          replace_original: true,
          text: "wooo you're officially an ape now! 🐵",
        }),
      );
    }
  } else if (payload.actions[0].action_id === "incorrect_username") {
    await replyToInteraction(
      payload.response_url,
      JSON.stringify({
        replace_original: true,
        text: "idk man that's the username associated with the apekey you provided 😒",
      }),
    );
  } else if (payload.actions[0].action_id === "replace_apekey") {
    await db
      .insert(users)
      .values({
        userId: payload.user.id,
        apeKey: JSON.parse(payload.actions[0].value).apeKey,
        username: JSON.parse(payload.actions[0].value).username,
      })
      .onConflictDoUpdate({
        target: users.userId,
        set: {
          apeKey: JSON.parse(payload.actions[0].value).apeKey,
          username: JSON.parse(payload.actions[0].value).username,
        },
      });

    await replyToInteraction(
      payload.response_url,
      JSON.stringify({
        replace_original: true,
        text: "replaced! 🐵",
      }),
    );
  } else if (payload.actions[0].action_id === "dont_replace_apekey") {
    await replyToInteraction(
      payload.response_url,
      JSON.stringify({
        replace_original: true,
        text: "i guess bro 🫩",
      }),
    );
  } else if (payload.actions[0].action_id === "delete_apekey") {
    await db.delete(users).where(eq(users.userId, payload.user.id));
    await replyToInteraction(
      payload.response_url,
      JSON.stringify({
        replace_original: true,
        text: "you're no longer an ape 🦧",
      }),
    );
  } else if (payload.actions[0].action_id === "cancel_delete_apekey") {
    await replyToInteraction(
      payload.response_url,
      JSON.stringify({
        replace_original: true,
        text: "🦧",
      }),
    );
  }
  return {};
});

fastify.post("/setapekey", async (req, res) => {
  const body = req.body as SlashCommandReqBody;
  const apeKey = body.text.trim();

  const userName = await getNameFromLastTest(apeKey);
  if (!userName) {
    return {
      response_type: "ephemeral",
      text: "invalid apekey 🙄",
    };
  }

  const q = createTextEl("mrkdwn", `are you *${userName}* on monkeytype? 🤔`);
  const choices = [
    createButtonEl(
      "yeah",
      "correct_username",
      JSON.stringify({
        apeKey,
        username: userName,
      }),
    ),
    createButtonEl("uh no", "incorrect_username", apeKey),
  ];
  const mcq = createTextOnlyMCQ(q, choices);

  return {
    response_type: "ephemeral",
    text: "please use a normal slack client bruh",
    blocks: mcq.blocks,
  };
});

fastify.post("/deleteapekey", async (req, res) => {
  console.log("hi lol");
  const body = req.body as SlashCommandReqBody;
  const userId = body.user_id;
  const userExists = !!(await db.query.users.findFirst({
    where: eq(users.userId, userId),
  }));
  if (!userExists) {
    return {
      response_type: "ephemeral",
      text: "how are you gonna delete an apekey when you haven't even set one 🫩",
    };
  }
  const q = createTextEl(
    "mrkdwn",
    `once your apekey is deleted, you won't be able to use the bot until you add another apekey using \`/setapekey\`. do you still want to delete the apekey?`,
  );
  const choices = [
    createButtonEl("yeah", "delete_apekey", "uh"),
    createButtonEl("nah", "cancel_delete_apekey", "uh"),
  ];
  const mcq = createTextOnlyMCQ(q, choices);
  return {
    response_type: "ephemeral",
    text: "please use a normal slack client bruh",
    blocks: mcq.blocks,
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
