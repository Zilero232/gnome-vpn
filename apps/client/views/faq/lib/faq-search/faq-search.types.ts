export type FaqEntry = {
  value: string;
  question: string;
  answer: string;
};

export type FaqGroupView = {
  key: string;
  title: string;
  items: FaqEntry[];
};

export type FaqHit = FaqEntry & {
  group: string;
  score: number;
};

export type SearchFaqInput = {
  groups: FaqGroupView[];
  query: string;
  topic: string | null;
};

export type SearchFaqResult = {
  terms: string[][];
  groups: FaqGroupView[];
  hits: FaqHit[];
  count: number;
};

export type HighlightInput = {
  text: string;
  terms: string[][];
};

export type HighlightSegment = {
  text: string;
  start: number;
  isMatch: boolean;
};

export type ScoreInput = {
  entry: FaqEntry;
  terms: string[][];
};

export type MatchesInput = {
  tokens: string[];
  alternatives: readonly string[];
};

export type WeighInput = MatchesInput & {
  weights: { exact: number; word: number; synonym: number };
};
