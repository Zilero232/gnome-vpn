import type { ReactNode } from 'react';

export type DataColumn<Row> = {
  key: string;
  header: string;
  cell: (row: Row) => ReactNode;
  align?: 'end' | 'start';
  isPrimary?: boolean;
};

export type DataTableProps<Row> = {
  columns: DataColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  caption: string;
  empty?: ReactNode;
  isFaded?: boolean;
  className?: string;
};
