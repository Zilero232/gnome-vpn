import { describe, expect, it } from 'vitest';

import type { CsvColumn } from '../csv.types';

import { ADMIN_CSV } from '../../../config';
import { csvCell, toCsv } from '../csv';

type Row = { name: string; amount: number; note: string | null };

const COLUMNS: CsvColumn<Row>[] = [
  { header: 'name', value: (row) => row.name },
  { header: 'amount', value: (row) => row.amount },
  { header: 'note', value: (row) => row.note }
];

const body = (csv: string) => csv.slice(ADMIN_CSV.bom.length);

describe('csvCell', () => {
  it('leaves a plain value as it is', () => {
    expect(csvCell('plain')).toBe('plain');
  });

  it('quotes a value holding a delimiter, a quote or a line break, doubling inner quotes', () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell('two\nlines')).toBe('"two\nlines"');
  });

  it('defuses a text that a spreadsheet would run as a formula', () => {
    for (const start of ['=', '+', '-', '@', '\t', '\r']) {
      expect(csvCell(`${start}SUM(A1)`).replaceAll('"', '').startsWith(ADMIN_CSV.formulaGuard)).toBe(true);
    }
  });

  it('keeps a negative number a number', () => {
    expect(csvCell(-5)).toBe('-5');
  });

  it('writes an empty cell for a missing value', () => {
    expect(csvCell(null)).toBe('');
  });
});

describe('toCsv', () => {
  it('opens with a byte order mark so spreadsheets read it as UTF-8', () => {
    expect(toCsv({ columns: COLUMNS, rows: [] }).startsWith(ADMIN_CSV.bom)).toBe(true);
  });

  it('writes the header and one CRLF-terminated line per row', () => {
    const rows: Row[] = [
      { name: 'Иван', amount: 200, note: null },
      { name: 'Anna', amount: 990, note: 'renewal' }
    ];

    const lines = body(toCsv({ columns: COLUMNS, rows })).split(ADMIN_CSV.lineBreak);

    expect(lines).toHaveLength(rows.length + 2);
    expect(lines[0]).toBe(COLUMNS.map((column) => column.header).join(ADMIN_CSV.delimiter));
    expect(lines[1]).toBe('Иван,200,');
    expect(lines.at(-1)).toBe('');
  });
});
