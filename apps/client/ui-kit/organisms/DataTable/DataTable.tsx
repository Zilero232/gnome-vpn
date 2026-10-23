import { clsx } from 'clsx';

import type { DataTableProps } from './DataTable.types';

import s from './DataTable.module.scss';

export const DataTable = <Row extends object>({ columns, rows, rowKey, caption, empty, isFaded = false, className }: DataTableProps<Row>) => {
  if (rows.length === 0 && empty) {
    return <div className={clsx(s.empty, className)}>{empty}</div>;
  }

  return (
    <div aria-busy={isFaded} className={clsx(s.root, className)} data-faded={isFaded}>
      <table className={s.table} role='table'>
        <caption className={s.caption}>{caption}</caption>

        {/* eslint-disable-next-line siberiacancode-jsx-a11y/no-redundant-roles -- the rows turn into cards below 2xl; Safari drops implicit table roles under display: block/flex, so they are spelled out */}
        <thead className={s.head} role='rowgroup'>
          <tr role='row'>
            {columns.map((column) => (
              <th key={column.key} className={s.th} data-align={column.align ?? 'start'} role='columnheader' scope='col'>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* eslint-disable-next-line siberiacancode-jsx-a11y/no-redundant-roles -- the rows turn into cards below 2xl; Safari drops implicit table roles under display: block/flex, so they are spelled out */}
        <tbody className={s.body} role='rowgroup'>
          {rows.map((row) => (
            <tr key={rowKey(row)} className={s.row} role='row'>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={s.cell}
                  data-align={column.align ?? 'start'}
                  data-label={column.header}
                  data-primary={column.isPrimary === true}
                  // eslint-disable-next-line siberiacancode-jsx-a11y/no-interactive-element-to-noninteractive-role -- the rows turn into cards below 2xl; Safari drops implicit table roles under display: block/flex, so they are spelled out
                  role='cell'
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
