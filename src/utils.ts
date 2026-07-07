import type { LastResult } from "./types/api";
import type { ButtonEl, TextEl } from "./types/misc";

export function createTextEl(type: "plain_text" | "mrkdwn", text: string) {
  return {
    type: type,
    text: text,
  } as TextEl;
}

export function createButtonEl(text: string, action_id: string, value: string) {
  return {
    type: "button",
    text: createTextEl("plain_text", text),
    action_id,
    value,
  } as ButtonEl;
}

export function createTextOnlyMCQ(question: TextEl, choices: ButtonEl[]) {
  return {
    blocks: [
      {
        type: "section",
        text: question,
      },
      {
        type: "actions",
        elements: choices,
      },
    ],
  };
}

export async function replyToInteraction(response_url: any, body: string) {
  await fetch(response_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
}

export async function getNameFromLastTest(apeKey: string) {
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
