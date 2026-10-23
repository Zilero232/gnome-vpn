export type CsvCell = boolean | number | string | null;

export type CsvColumn<Row> = {
  header: string;
  value: (row: Row) => CsvCell;
};

export type ToCsvInput<Row> = {
  columns: CsvColumn<Row>[];
  rows: Row[];
};
