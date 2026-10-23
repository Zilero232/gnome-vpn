export type ShareRow = {
  label: string | null;
  count: number;
};

export type FoldSharesInput = {
  rows: ShareRow[];
  limit: number;
};
