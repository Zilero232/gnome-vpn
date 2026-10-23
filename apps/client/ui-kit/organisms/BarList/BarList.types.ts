export type BarListItem = {
  key: string;
  label: string;
  value: number;
  detail?: string;
};

export type BarListProps = {
  items: BarListItem[];
  formatValue: (value: number) => string;
  formatShare: (share: number) => string;
  label: string;
  className?: string;
};

export type BarShare = BarListItem & {
  share: number;
};
