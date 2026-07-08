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

import { WebClient, ErrorCode, type WebAPIPlatformError } from "@slack/web-api";
const client = new WebClient(process.env.SLACK_BOT_TOKEN);

import { formatInTimeZone } from "date-fns-tz";

import { Canvas } from "skia-canvas";

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  registerables,
} from "chart.js";
Chart.register(
  ...registerables,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
);

const canvas = new Canvas(800, 200);
const ctx = canvas.getContext("2d");

ctx.fillStyle = "#fff";
ctx.fillRect(0, 0, canvas.width, canvas.height);

new Chart(canvas as any, {
  data: {
    labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    datasets: [
      {
        type: "line",
        label: "wpm",
        yAxisID: "wpm",
        data: [
          192, 174, 128, 126, 132, 116, 122, 117, 115, 116, 119, 113, 115, 120,
          123,
        ],
        borderColor: "#4fd1e8",
        tension: 0.4,
      },
      {
        type: "line",
        label: "burst",
        yAxisID: "wpm",
        data: [
          192, 156, 108, 72, 156, 132, 156, 132, 84, 132, 144, 60, 144, 180,
          168,
        ],
        borderColor: "#4fd1e8",
        tension: 0.4,
      },
      {
        type: "scatter",
        yAxisID: "err",
        label: "err",
        data: [
          null,
          null,
          2,
          null,
          null,
          2,
          null,
          3,
          null,
          null,
          null,
          1,
          null,
          null,
          null,
        ],
        borderColor: "#4fd1e8",
        tension: 0.4,
      },
    ],
  },
  options: {
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      wpm: {
        type: "linear",
        display: true,
        position: "left",
        min: 0,
        ticks: {
          stepSize: 40,
          display: false,
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      err: {
        type: "linear",
        display: true,
        position: "right",
        max: 8,
        min: 0,
        grid: {
          drawOnChartArea: false,
          display: false,
        },
        ticks: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
  },
});

await Bun.write("chart.png", await canvas.png);

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

fastify.post("/lastrun", async (req, res) => {
  const body = req.body as SlashCommandReqBody;
  const user = await db.query.users.findFirst({
    where: eq(users.userId, body.user_id),
  });

  if (!user) {
    return {
      response_type: "ephemeral",
      text: "no idea who you are. use /setapekey to register 🐒",
      blocks: [
        {
          type: "section",
          text: createTextEl(
            "mrkdwn",
            `no idea who you are. use \`/setapekey\` to register 🐒`,
          ),
        },
      ],
    };
  }

  const url = `https://api.monkeytype.com/results/last`;
  const headers = { Authorization: `ApeKey ${user.apeKey}` };
  const response = await fetch(url, {
    headers,
  });

  if (response.status != 200) {
    return {
      response_type: "ephemeral",
      text: "request failed. you might wanna set a new apekey with /setapekey 🐒",
      blocks: [
        {
          type: "section",
          text: createTextEl(
            "mrkdwn",
            `request failed. you might wanna set a new apekey with \`/setapekey\` 🐒`,
          ),
        },
      ],
    };
  }

  const barebonesData = await response.json();

  console.log(barebonesData);

  const data = (
    barebonesData as {
      data: {
        wpm: number;
        acc: number;
        timestamp: number;
        rawWpm: number;
        mode: string;
        mode2: string;
        testDuration: number;
        charStats: number[];
        consistency: number;
        chartData: {
          wpm: number[];
          burst: number[];
          err: number[];
        };
        language: string;
      };
    }
  ).data;

  const d = formatInTimeZone(
    data.timestamp,
    "UTC",
    "HH:mm 'on' dd MMM yyyy 'GMT'",
  );

  try {
    await client.chat.postMessage({
      channel: body.channel_id,
      text: "hi lol 🦧",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${Math.round(data.wpm)} WPM  /  ${Math.round(data.acc)}% acc`,
          },
          level: 1,
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*mode*: ${data.mode} ${data.mode2}`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*raw*: ${Math.round(data.rawWpm)} WPM`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*characters*: ${data.charStats.join("/")}`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*consistency*: ${Math.round(data.consistency)}%`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*time*: ${Math.round(data.testDuration)}s`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*language*: ${data.language ? data.language : "english"}`,
          },
        },
        {
          type: "divider",
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `test taken by <@${user.userId}> at ${d}`,
            },
          ],
        },
      ],
    });
    res.code(200).send();
    return;
  } catch (e) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      e.code === ErrorCode.PlatformError
    ) {
      const err = e as WebAPIPlatformError;

      if (err.data.error === "channel_not_found") {
        return {
          response_type: "ephemeral",
          text: "add me in the channel to run this 🐵",
        };
      }

      console.log(err.data.error);
      console.log(err.data.response_metadata);
    } else {
      console.error(e);
    }
  }

  return {};
});

try {
  await fastify.listen({
    port: 3000,
  });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
