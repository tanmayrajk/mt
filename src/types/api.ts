export interface SlashCommandReqBody {
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

export interface LastResult {
  data: {
    _id: string;
    uid: string;
    wpm: number;
    rawWpm: number;
    charStats: number[];
    acc: number;
    mode: string;
    mode2: string;
    timestamp: number;
    testDuration: number;
    consistency: number;
    keyConsistency: number;
    chartData: {
      wpm: number[];
      burst: number[];
      err: number[];
    };
    name: string;
    keySpacingStats: {
      average: number;
      sd: number;
    };
    keyDurationStats: {
      average: number;
      sd: number;
    };
  };
}
