export type TopicChip = {
  key: string;
  title: string;
};

export type TopicChipsProps = {
  topics: TopicChip[];
  value: string | null;
  onChange: (value: string | null) => void;
};
