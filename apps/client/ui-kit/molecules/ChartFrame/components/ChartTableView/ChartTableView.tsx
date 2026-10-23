import type { ChartTableViewProps } from './ChartTableView.types';

import s from './ChartTableView.module.scss';

export const ChartTableView = ({ table, caption }: ChartTableViewProps) => (
  // eslint-disable-next-line siberiacancode-jsx-a11y/no-noninteractive-tabindex -- a scrollable region has to be reachable from the keyboard
  <div aria-label={caption} className={s.scroll} role='region' tabIndex={0}>
    <table className={s.table}>
      {caption && <caption className={s.caption}>{caption}</caption>}

      <thead>
        <tr>
          {table.columns.map((column, index) => (
            <th key={column} className={s.head} data-numeric={index > 0} scope='col'>
              {column}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {table.rows.map((row) => (
          <tr key={row.key}>
            {row.cells.map((cell, index) => {
              const Cell = index === 0 ? 'th' : 'td';

              return (
                // eslint-disable-next-line react/no-array-index-key -- a row's cells are positional: the column order is the key
                <Cell key={index} className={s.cell} data-numeric={index > 0} scope={index === 0 ? 'row' : undefined}>
                  {cell}
                </Cell>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
