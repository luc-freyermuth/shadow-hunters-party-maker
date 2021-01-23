export interface PickStat {
  name: string;
  date: string;
  choices: string[];
  pick: string;
}

export interface FeedbackStat {
  name: string;
  date: string;
  pick: string;
  win: boolean;
  funLevel: number;
}

export interface Stats {
  picks: PickStat[];
  feedbacks: FeedbackStat[];
}
