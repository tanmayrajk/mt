import { App } from "@slack/bolt";
const slack = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

import { db } from "./db";
import { users } from "./db/schema";
import type { LastResult, LeaderboardRank, TestActivity } from "./types/api";
import { eq, isNotNull } from "drizzle-orm";

import { getNameFromLastTest } from "./utils";

import { WebClient } from "@slack/web-api";
const client = new WebClient(process.env.SLACK_BOT_TOKEN);

import { formatInTimeZone } from "date-fns-tz";
import { generateGraphLikeABigBoy } from "./graph";

slack.command("/setapekey", async ({ command, ack, respond }) => {
  await ack();

  const apeKey = command.text.trim();

  if (!apeKey) {
    await respond({
      text: "brah put the apekey 🙄",
    });
    return;
  }

  const userName = await getNameFromLastTest(apeKey);

  if (!userName) {
    await respond({
      text: "invalid apekey 🙄",
    });
    return;
  } else if (userName === 404) {
    await respond({
      text: "seems like your account is new. do some tests first and then try again",
    });
    return;
  }

  await respond({
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
            value: JSON.stringify({
              apeKey,
              username: userName,
            }),
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
  });
});

slack.action("correct_username", async ({ ack, action, body, respond }) => {
  await ack();

  if (action.type != "button") return;
  const data = await JSON.parse(action.value!);

  const userExists = !!(await db.query.users.findFirst({
    where: eq(users.userId, body.user.id),
  }));

  if (userExists) {
    await respond({
      blocks: [
        {
          type: "section",
          text: {
            type: "plain_text",
            text: "an apekey associated with this user already exists. do you want to replace it? 🤔",
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
              value: JSON.stringify(data),
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "nope",
              },
              action_id: "dont_replace_apekey",
              value: JSON.stringify(data),
            },
          ],
        },
      ],
      text: "please use a normal slack client bruh",
      replace_original: true,
    });
  } else {
    await db
      .insert(users)
      .values({
        userId: body.user.id,
        apeKey: data.apeKey,
        username: data.username,
      })
      .onConflictDoUpdate({
        target: users.userId,
        set: {
          apeKey: data.apeKey,
          username: data.username,
        },
      });

    await respond({
      blocks: [
        {
          type: "section",
          text: {
            type: "plain_text",
            text: "wooo you're officially an ape now! 🐵",
          },
        },
      ],
      text: "wooo you're officially an ape now! 🐵",
      replace_original: true,
    });
  }
});
slack.action("incorrect_username", async ({ ack, action, body, respond }) => {
  await ack();
  await respond({
    text: "idk man that's the username associated with the apekey you provided 😒",
    replace_original: true,
  });
});
slack.action("replace_apekey", async ({ ack, action, body, respond }) => {
  await ack();
  if (action.type != "button") return;
  const data = JSON.parse(action.value!);
  await db
    .insert(users)
    .values({
      userId: body.user.id,
      apeKey: data.apeKey,
      username: data.username,
    })
    .onConflictDoUpdate({
      target: users.userId,
      set: {
        apeKey: data.apeKey,
        username: data.username,
      },
    });

  await respond({
    replace_original: true,
    text: "replaced! 🐵",
  });
});
slack.action("dont_replace_apekey", async ({ ack, action, body, respond }) => {
  await ack();
  await respond({
    replace_original: true,
    text: "i guess bro 🫩",
  });
});

slack.command("/deleteapekey", async ({ command, ack, body, respond }) => {
  await ack();
  const userExists = !!(await db.query.users.findFirst({
    where: eq(users.userId, body.user_id),
  }));
  if (!userExists) {
    await respond({
      text: "how are you gonna delete an apekey when you haven't even set one 🫩",
    });
    return;
  }
  await respond({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `once your apekey is deleted, you won't be able to use the bot until you add another apekey using \`/setapekey\`. do you still want to delete the apekey?`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "yuh",
            },
            action_id: "delete_apekey",
            value: "uh",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "nuh",
            },
            action_id: "cancel_delete_apekey",
            value: "uh",
          },
        ],
      },
    ],
    text: "please use a normal slack client bruh",
  });
});

slack.action("delete_apekey", async ({ ack, action, body, respond }) => {
  await db.delete(users).where(eq(users.userId, body.user.id));
  await respond({
    replace_original: true,
    text: "you're no longer an ape 🦧",
  });
});
slack.action("cancel_delete_apekey", async ({ ack, action, body, respond }) => {
  await respond({
    replace_original: true,
    text: "🦧",
  });
});

slack.command("/lastrun", async ({ command, ack, body, respond }) => {
  await ack();
  const user = await db.query.users.findFirst({
    where: eq(users.userId, body.user_id),
  });

  if (!user) {
    await respond({
      text: "no idea who you are. use /setapekey to register 🐒",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `no idea who you are. use \`/setapekey\` to register 🐒`,
          },
        },
      ],
    });
    return;
  }

  const url = `https://api.monkeytype.com/results/last`;
  const headers = { Authorization: `ApeKey ${user.apeKey}` };
  const response = await fetch(url, {
    headers,
  });

  if (response.status != 200) {
    await respond({
      text: "request failed. you might wanna set a new apekey with /setapekey 🐒",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `request failed. you might wanna set a new apekey with \`/setapekey\` 🐒`,
          },
        },
      ],
    });
  }

  const barebonesData = await response.json();

  console.log(barebonesData);

  const data = (barebonesData as LastResult).data;

  const d = formatInTimeZone(
    data.timestamp,
    "UTC",
    "HH:mm 'on' dd MMM yyyy 'GMT'",
  );

  try {
    await client.chat.postMessage({
      channel: body.channel_id,
      text: "test results",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${Math.round(data.wpm)} WPM  /  ${Math.round(data.acc)}% acc`,
          },
          level: 1,
        } as any,
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*test type*: ${data.mode} ${data.mode2}${data.numbers ? " numbers" : ""}${data.punctuation ? " punctuation" : ""}${data.language ? " " + data.language : " english"}`,
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
            text: `\`\`\`${generateGraphLikeABigBoy(data.chartData.wpm)}\`\`\``,
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
  } catch (err) {
    const e = err as {
      code?: string;
      data?: { error?: string };
      message?: string;
    };

    if (
      e.code === "slack_webapi_platform_error" &&
      e.data?.error === "channel_not_found"
    ) {
      await respond({
        text: "add me in the channel to run this 🐵",
      });
      return;
    }

    console.error(e);
  }
});

slack.command("/activity", async ({ command, ack, body, respond }) => {
  await ack();
  const user = await db.query.users.findFirst({
    where: eq(users.userId, body.user_id),
  });

  if (!user) {
    await respond({
      text: "no idea who you are. use /setapekey to register 🐒",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `no idea who you are. use \`/setapekey\` to register 🐒`,
          },
        },
      ],
    });
    return;
  }

  const url = "https://api.monkeytype.com/users/currentTestActivity";
  const streakRes = await fetch(url, {
    headers: { Authorization: `ApeKey ${user.apeKey}` },
  });

  const testsActivity = ((await streakRes.json()) as TestActivity).data
    .testsByDays;

  const today = new Date();

  let startDay = new Date(today);
  startDay.setDate(startDay.getDate() - 105);

  const requiredActivity = testsActivity.slice(-105);

  let text = `${startDay.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })} -> `;
  requiredActivity.forEach((a, i) => {
    if (i !== 0 && i % 7 === 0) {
      text += "  ";
    }
    if (i !== 0 && i % 21 === 0) {
      text += "\n";
      const spaces = " ".repeat(
        today.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).length + 4,
      );
      text += spaces;
    }
    if (a === 0 || a === null) {
      text += "⬜";
      return;
    }

    if (a <= 3) {
      text += "🟨";
      return;
    } else if (a <= 6) {
      text += "🟧";
      return;
    } else if (a <= 9) {
      text += "🟫";
      return;
    } else if (a > 9) {
      text += "🟥";
      return;
    }
  });

  text += ` <- ${today.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;

  await client.chat.postMessage({
    channel: body.channel_id,
    text: "activity",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `\`\`\`${text}\`\`\``,
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
            text: `monkeytype activity graph for <@${user.userId}>  |  less ⬜🟨🟧🟫🟥 more  |  reads left to right`,
          },
        ],
      },
    ],
  });
});

slack.command("/leaderboard", async ({ command, ack, body, respond }) => {
  await ack();
  const user = await db.query.users.findFirst({
    where: eq(users.userId, body.user_id),
  });

  if (!user) {
    await respond({
      text: "no idea who you are. use /setapekey to register 🐒",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `no idea who you are. use \`/setapekey\` to register 🐒`,
          },
        },
      ],
    });
    return;
  }

  const mode = body.text.split(" ")[0]?.trim() || "";
  const mode2 = Number.isInteger(Number(body.text.split(" ")[1]?.trim()))
    ? Number(body.text.split(" ")[1]?.trim()).toString()
    : mode === "words"
      ? "50"
      : "15";

  if (!["words", "time"].includes(mode)) {
    await respond({
      text: "add 'word' or 'time' after the command to get the respective leaderboard",
    });
    return;
  }

  const url = `https://api.monkeytype.com/users/personalBests?mode=${mode}&mode2=${mode2}`;
  const allUsers = await db.query.users.findMany({
    where: isNotNull(users.apeKey),
  });

  let leaderboardData = [];

  for (let i = 0; i < allUsers.length; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `ApeKey ${allUsers[i]?.apeKey}`,
        },
      });

      if (!res.ok) {
        console.log("bye lol");
        continue;
      }
      const data = (await res.json()) as LeaderboardRank;
      if (data.data === null) continue;
      leaderboardData.push({
        userId: allUsers[i]?.userId,
        wpm: Math.round(data.data.wpm),
        acc: Math.round(data.data.acc),
      });
    } catch (e) {
      console.log(e);
      continue;
    }
  }

  if (leaderboardData.length <= 0) {
    await respond({
      text: "no user in the database is in the leaderboards for that specific test. try again with a different test.",
    });
    return;
  }

  leaderboardData.sort((a, b) => b.wpm - a.wpm);

  const leaderboardBlocks = leaderboardData.map((u, i) => {
    return {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${i + 1}. *<@${u.userId}>* — ${u.wpm}WPM / ${u.acc}%\n`,
      },
    };
  });

  try {
    await client.chat.postMessage({
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `leaderboard for ${mode} ${mode2}`,
          },
          level: 1,
        } as any,
        ...leaderboardBlocks,
        {
          type: "divider",
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `\`/leaderboard\` run by <@${body.user_id}`,
            },
          ],
        },
      ],
      text: `leaderboard for ${mode} ${mode2}`,
      channel: body.channel_id,
    });
  } catch (err) {
    const e = err as {
      code?: string;
      data?: { error?: string };
      message?: string;
    };

    if (
      e.code === "slack_webapi_platform_error" &&
      e.data?.error === "channel_not_found"
    ) {
      await respond({
        text: "add me in the channel to run this 🐵",
      });
      return;
    }

    console.error(e);
  }

  console.log(leaderboardData);
});

try {
  await slack.start({
    port: Number(process.env.PORT) || 3000,
    host: "0.0.0.0",
  });
} catch (err) {
  console.log(err);
  process.exit(1);
}
