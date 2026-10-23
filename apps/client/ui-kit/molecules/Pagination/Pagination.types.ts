export type PaginationLabels = {
  previous: string;
  next: string;
  status: string;
};

export type PaginationProps = {
  page: number;
  pages: number;
  labels: PaginationLabels;
  isDisabled?: boolean;
  className?: string;
  onChange: (page: number) => void;
};
