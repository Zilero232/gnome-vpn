import { ADMIN_EXPORT, ADMIN_PAGE, ADMIN_PERIOD_DAYS, ADMIN_PERIODS } from '@gnomevpn/schemas';
import { differenceInCalendarDays } from 'date-fns';
import { times } from 'remeda';
import { describe, expect, it } from 'vitest';

import { dayKey } from '@/common/lib';
import { Prisma } from '@/generated';

import type { CsvCell, CsvColumn } from '../admin.types';

import { ADMIN_CSV } from '../admin.config';
import { amountOf, csvFile, groupTotal, pageWindow, periodStart, toCsv } from '../listing.helpers';

const NOW = new Date('2026-10-23T12:00:00.000Z');

const SIZE = 25;

describe('pageWindow', () => {
  it('skips the rows of every page before the one asked for', () => {
    const window = pageWindow({ page: 3, total: SIZE * 10, size: SIZE });

    expect(window.skip).toBe((window.info.page - 1) * SIZE);
    expect(window.take).toBe(SIZE);
  });

  it('counts a partly filled last page as a page', () => {
    expect(pageWindow({ page: 1, total: SIZE * 2 + 1, size: SIZE }).info.pages).toBe(3);
  });

  it('keeps one page for an empty result, so page 1 always exists', () => {
    const window = pageWindow({ page: 1, total: 0, size: SIZE });

    expect([window.info.page, window.info.pages, window.skip]).toEqual([1, 1, 0]);
  });

  it('moves a page past the end back to the last page', () => {
    const window = pageWindow({ page: 99, total: SIZE * 2, size: SIZE });

    expect(window.info.page).toBe(window.info.pages);
    expect(window.skip).toBeLessThan(window.info.total);
  });

  it('never goes below the first page', () => {
    expect(pageWindow({ page: 0, total: SIZE, size: SIZE }).info.page).toBe(1);
  });

  it('pages by the panel page size unless told otherwise', () => {
    expect(pageWindow({ page: 1, total: 0 }).take).toBe(ADMIN_PAGE.size);
  });
});

describe('periodStart', () => {
  it('reaches back exactly the period length', () => {
    for (const period of ADMIN_PERIODS) {
      const start = periodStart({ period, now: NOW });
      const days = ADMIN_PERIOD_DAYS[period];

      expect(start === null ? null : differenceInCalendarDays(NOW, start)).toBe(days);
    }
  });

  it('has no lower bound for all time', () => {
    expect(periodStart({ period: 'all', now: NOW })).toBeNull();
  });

  it('starts later for a shorter period', () => {
    const week = periodStart({ period: '7d', now: NOW });
    const month = periodStart({ period: '30d', now: NOW });

    expect(week && month && week > month).toBe(true);
  });
});

describe('amountOf', () => {
  it('reads a sum as a number and no sum as no money', () => {
    expect(amountOf(new Prisma.Decimal('990.50'))).toBe(990.5);
    expect(amountOf(null)).toBe(0);
    expect(amountOf(undefined)).toBe(0);
  });
});

describe('groupTotal', () => {
  const GROUPS = [
    { plan: 'month', _count: { _all: 3 }, _sum: { amount: new Prisma.Decimal('2970.00') } },
    { plan: 'year', _count: { _all: 1 }, _sum: { amount: null } }
  ];

  it('reads the count and the summed amount of the matching group', () => {
    expect(groupTotal({ groups: GROUPS, by: 'plan', value: 'month' })).toEqual({ count: 3, amount: 2970 });
  });

  it('reads a group whose amounts were all null as no money', () => {
    expect(groupTotal({ groups: GROUPS, by: 'plan', value: 'year' })).toEqual({ count: 1, amount: 0 });
  });

  it('reads a value the query returned no group for as nothing', () => {
    expect(groupTotal({ groups: GROUPS, by: 'plan', value: 'quarter' })).toEqual({ count: 0, amount: 0 });
  });

  it('counts groups that carry no sum at all', () => {
    expect(groupTotal({ groups: [{ referrerId: 'a', _count: { _all: 2 } }], by: 'referrerId', value: 'a' }).count).toBe(2);
  });
});

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

describe('csvFile', () => {
  const row: Row = { name: 'Anna', amount: 990, note: null };

  it('names the file after the export and the day it was made', () => {
    expect(csvFile({ name: 'export', rows: [row], columns: COLUMNS, now: NOW }).filename).toBe(`export-${dayKey(NOW)}${ADMIN_CSV.extension}`);
  });

  it('writes at most the export cap and says when it cut rows off', () => {
    const full = csvFile({ name: 'export', rows: times(ADMIN_EXPORT.maxRows, () => row), columns: COLUMNS, now: NOW });
    const over = csvFile({ name: 'export', rows: times(ADMIN_EXPORT.maxRows + 1, () => row), columns: COLUMNS, now: NOW });

    expect([full.rows, full.isTruncated]).toEqual([ADMIN_EXPORT.maxRows, false]);
    expect([over.rows, over.isTruncated]).toEqual([ADMIN_EXPORT.maxRows, true]);
  });
});
