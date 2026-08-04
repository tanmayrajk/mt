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
    language?: string;
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

export interface TestActivity {
  message: string,
  data: {
    testsByDays: (number | null)[]
    lastDay: number | null
  }
}
