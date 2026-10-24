import type { AdminCsvFile } from '@gnomevpn/schemas';

import { ADMIN_EXPORT, ADMIN_PAGE, ADMIN_PERIOD_DAYS } from '@gnomevpn/schemas';
import { stringify } from 'csv-stringify/sync';
import { subDays } from 'date-fns';
import { clamp, isNullish } from 'remeda';

import type { Prisma } from '@/generated';

import { dayKey } from '@/common/lib';

import type { CsvFileInput, GroupTotal, GroupTotalInput, PageWindow, PageWindowInput, PeriodStartInput, ToCsvInput, TotalGroup } from './admin.types';

import { ADMIN_CSV } from './admin.config';

export const pageWindow = ({ page, total, size = ADMIN_PAGE.size }: PageWindowInput): PageWindow => {
  const pages = Math.max(1, Math.ceil(total / size));
  const current = clamp(Math.trunc(page), { min: 1, max: pages });

  return { info: { page: current, pages, pageSize: size, total }, skip: (current - 1) * size, take: size };
};

export const periodStart = ({ period, now }: PeriodStartInput): Date | null => {
  const days = ADMIN_PERIOD_DAYS[period];

  return isNullish(days) ? null : subDays(now, days);
};

export const amountOf = (amount: Prisma.Decimal | null | undefined): number => amount?.toNumber() ?? 0;

export const groupTotal = <Group extends TotalGroup, Key extends keyof Group>({ groups, by, value }: GroupTotalInput<Group, Key>): GroupTotal => {
  const group = groups.find((each) => each[by] === value);

  return { count: group?._count._all ?? 0, amount: amountOf(group?._sum?.amount) };
};

export const isoOrNull = (date: Date | null | undefined): string | null => date?.toISOString() ?? null;

export const toCsv = <Row>({ columns, rows }: ToCsvInput<Row>): string =>
  stringify(
    rows.map((row) => columns.map((column) => column.value(row))),
    { ...ADMIN_CSV.options, columns: columns.map((column) => column.header) }
  );

export const csvFile = <Row>({ name, rows, columns, now }: CsvFileInput<Row>): AdminCsvFile => {
  const exported = rows.slice(0, ADMIN_EXPORT.maxRows);

  return {
    filename: `${name}-${dayKey(now)}${ADMIN_CSV.extension}`,
    content: toCsv({ columns, rows: exported }),
    rows: exported.length,
    isTruncated: rows.length > ADMIN_EXPORT.maxRows
  };
};
