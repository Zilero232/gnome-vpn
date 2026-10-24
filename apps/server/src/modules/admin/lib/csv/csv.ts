import { stringify } from 'csv-stringify/sync';

import { ADMIN_CSV } from '@/modules/admin/config';

import type { ToCsvInput } from './csv.types';

export const toCsv = <Row>({ columns, rows }: ToCsvInput<Row>): string =>
  stringify(
    rows.map((row) => columns.map((column) => column.value(row))),
    { ...ADMIN_CSV, columns: columns.map((column) => column.header) }
  );
