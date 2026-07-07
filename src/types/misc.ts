export interface TextEl {
  type: "plain_text" | "mrkdwn";
  text: string;
}

export interface ButtonEl {
  type: "button";
  text: TextEl;
  action_id: string;
  value: string;
}
