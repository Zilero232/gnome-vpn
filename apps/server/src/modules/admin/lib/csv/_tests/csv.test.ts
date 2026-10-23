import { describe, expect, it } from 'vitest';

import type { CsvCell, CsvColumn } from '../csv.types';

import { toCsv } from '../csv';

type Row = { name: string; amount: number; note: string | null };

const BOM = '﻿';
const CRLF = '\r\n';

const COLUMNS: CsvColumn<Row>[] = [
  { header: 'name', value: (row) => row.name },
  { header: 'amount', value: (row) => row.amount },
  { header: 'note', value: (row) => row.note }
];

const cellOf = (cell: CsvCell): string =>
  toCsv({ columns: [{ header: 'cell', value: (value: CsvCell) => value }], rows: [cell] })
    .slice(`${BOM}cell${CRLF}`.length)
    .slice(0, -CRLF.length);

describe('a csv cell', () => {
  it('leaves a plain value as it is', () => {
    expect(cellOf('plain')).toBe('plain');
  });

  it('quotes a value holding a delimiter, a quote or a line break, doubling inner quotes', () => {
    expect(cellOf('a,b')).toBe('"a,b"');
    expect(cellOf('say "hi"')).toBe('"say ""hi"""');
    expect(cellOf('two\nlines')).toBe('"two\nlines"');
    expect(cellOf('two\r\nlines')).toBe('"two\r\nlines"');
  });

  it('defuses a text that a spreadsheet would run as a formula', () => {
    for (const start of ['=', '+', '-', '@', '\t', '\r']) {
      expect(cellOf(`${start}SUM(A1)`).replaceAll('"', '').startsWith("'")).toBe(true);
    }
  });

  it('keeps a negative number a number', () => {
    expect(cellOf(-5)).toBe('-5');
  });

  it('writes a flag as a word, not as a one or a blank', () => {
    expect(cellOf(true)).toBe('true');
    expect(cellOf(false)).toBe('false');
  });

  it('writes an empty cell for a missing value', () => {
    expect(cellOf(null)).toBe('');
  });
});

describe('toCsv', () => {
  it('opens with a byte order mark so spreadsheets read it as UTF-8', () => {
    expect(toCsv({ columns: COLUMNS, rows: [] }).startsWith(BOM)).toBe(true);
  });

  it('writes the header even when there are no rows', () => {
    expect(toCsv({ columns: COLUMNS, rows: [] })).toBe(`${BOM}name,amount,note${CRLF}`);
  });

  it('writes the header and one CRLF-terminated line per row', () => {
    const rows: Row[] = [
      { name: 'Иван', amount: 200, note: null },
      { name: 'Anna', amount: 990, note: 'renewal' }
    ];

    const lines = toCsv({ columns: COLUMNS, rows }).slice(BOM.length).split(CRLF);

    expect(lines).toHaveLength(rows.length + 2);
    expect(lines[0]).toBe(COLUMNS.map((column) => column.header).join(','));
    expect(lines[1]).toBe('Иван,200,');
    expect(lines.at(-1)).toBe('');
  });
});
