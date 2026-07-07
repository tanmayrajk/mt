import Fastify from "fastify";
import formbody from "@fastify/formbody";
const fastify = Fastify({
  logger: true,
});
fastify.register(formbody);

import { db } from "./db";
import { users } from "./db/schema";
import type { LastResult, SlashCommandReqBody } from "./types/api";
import { eq } from "drizzle-orm";

fastify.post("/interactivity", async (req, res) => {
  const body = req.body as { payload: string };
  const payload = JSON.parse(body.payload);
  console.log(payload);
  if (payload.actions[0].action_id === "correct_username") {
    const userExists = !!(await db.query.users.findFirst({
      where: eq(users.userId, payload.user.id),
    }));
    if (userExists) {
      await fetch(payload.response_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          replace_original: true,
          text: "please use a normal slack client bruh",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `an apekey associated with this user already exists. do you want to replace it? 🤔`,
              },
            },
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "yep",
                  },
                  action_id: "replace_apekey",
                  value: payload.actions[0].value,
                },
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "nope",
                  },
                  action_id: "dont_replace_apekey",
                  value: payload.actions[0].value,
                },
              ],
            },
          ],
        }),
      });
    } else {
      await db
        .insert(users)
        .values({
          userId: payload.user.id,
          apeKey: payload.actions[0].value,
        })
        .onConflictDoUpdate({
          target: users.userId,
          set: {
            apeKey: payload.actions[0].value,
          },
        });
      await fetch(payload.response_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          replace_original: true,
          text: "wooo you're officially an ape now! 🐵",
        }),
      });
    }
    console.log(
      "check if a apekey associated with that user alr exists, if yes then ask the user if they want to replace it or not, if yes then replace it",
    );
  } else if (payload.actions[0].action_id === "incorrect_username") {
    console.log("hi lol");
    await fetch(payload.response_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        replace_original: true,
        text: "idk man that's the username associated with the apekey you provided 😒",
      }),
    });
    // return {
    //   response_type: "ephemeral",
    //   replace_original: true,
    //   text: "idk man that's the username associated with the apekey you provided 😒",
    // };
  } else if (payload.actions[0].action_id === "replace_apekey") {
    await db
      .insert(users)
      .values({
        userId: payload.user.id,
        apeKey: payload.actions[0].value,
      })
      .onConflictDoUpdate({
        target: users.userId,
        set: {
          apeKey: payload.actions[0].value,
        },
      });
    await fetch(payload.response_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        replace_original: true,
        text: "replaced! 🐵",
      }),
    });
  } else if (payload.actions[0].action_id === "dont_replace_apekey") {
    await fetch(payload.response_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        replace_original: true,
        text: "i guess bro 🫩",
      }),
    });
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
  } else {
    return {
      response_type: "ephemeral",
      text: "please use a normal slack client bruh",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `are you *${userName}* on monkeytype? 🤔`,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "yeah",
              },
              action_id: "correct_username",
              value: apeKey,
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "uh no",
              },
              action_id: "incorrect_username",
              value: apeKey,
            },
          ],
        },
      ],
    };
  }

  // await db
  //   .insert(users)
  //   .values({
  //     userId: body.user_id,
  //     apeKey: body.text,
  //   })
  //   .onConflictDoUpdate({
  //     target: users.userId,
  //     set: {
  //       apeKey: body.text,
  //     },
  //   });

  // return {
  //   response_type: "ephemeral",
  //   text: "you're officially an ape now!",
  // };
});

try {
  await fastify.listen({
    port: 3000,
  });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}

async function getNameFromLastTest(apeKey: string) {
  const getUidUrl = `https://api.monkeytype.com/results/last`;
  const headers = { Authorization: `ApeKey ${apeKey}` };
  const uidReq = await fetch(getUidUrl, {
    headers,
  });
  if (uidReq.status === 470) {
    return null;
  } else if (uidReq.status === 200) {
    const res = (await uidReq.json()) as LastResult;
    return res.data.name;
  } else {
    return null;
  }
}

// await getNameFromLastTest(
//   "NmE0YmVhZWIwMTdjNDlkMTQ1MjU4OTNiLmRYV0tfOHVZSlFrcVR1RnBzaldyaUlFUUU4cjJVM2ZZ",
// );
