import { stringify } from 'csv-stringify/sync';

import type { ToCsvInput } from './csv.types';

import { ADMIN_CSV } from '../../config';

export const toCsv = <Row>({ columns, rows }: ToCsvInput<Row>): string =>
  stringify(
    rows.map((row) => columns.map((column) => column.value(row))),
    { ...ADMIN_CSV, columns: columns.map((column) => column.header) }
  );
