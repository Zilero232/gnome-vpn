import { isNullish, isString } from 'remeda';

import type { CsvCell, ToCsvInput } from './csv.types';

import { ADMIN_CSV } from '../../config';

const quoted = (text: string): string =>
  ADMIN_CSV.needsQuotes.test(text) ? `${ADMIN_CSV.quote}${text.replaceAll(ADMIN_CSV.quote, ADMIN_CSV.quote.repeat(2))}${ADMIN_CSV.quote}` : text;

export const csvCell = (cell: CsvCell): string => {
  if (isNullish(cell)) {
    return '';
  }

  if (!isString(cell)) {
    return String(cell);
  }

  return quoted(ADMIN_CSV.formulaStart.test(cell) ? `${ADMIN_CSV.formulaGuard}${cell}` : cell);
};

export const toCsv = <Row>({ columns, rows }: ToCsvInput<Row>): string => {
  const header = columns.map((column) => csvCell(column.header)).join(ADMIN_CSV.delimiter);
  const lines = rows.map((row) => columns.map((column) => csvCell(column.value(row))).join(ADMIN_CSV.delimiter));

  return `${ADMIN_CSV.bom}${[header, ...lines].join(ADMIN_CSV.lineBreak)}${ADMIN_CSV.lineBreak}`;
};
