import type { LastResult } from "./types/api";

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
