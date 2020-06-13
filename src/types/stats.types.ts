export interface PickStat {
  name: string;
  date: string;
  choices: string[];
  pick: string;
}

export interface FeedbackStat {
  name: string;
  date: string;
  fun: number;
  win: boolean;
}

export interface Stats {
  picks: PickStat[];
  feedbacks: FeedbackStat[];
} 