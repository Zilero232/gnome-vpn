'use client';

import { clsx } from 'clsx';
import { useState } from 'react';

import type { ChartFrameProps, ChartView } from './ChartFrame.types';

import { Text } from '../../atoms';
import { Segmented } from '../Segmented';
import { ChartLegend, ChartTableView } from './components';

import s from './ChartFrame.module.scss';

export const ChartFrame = ({ title, summary, legend, table, labels, isFaded = false, className, children }: ChartFrameProps) => {
  const [view, setView] = useState<ChartView>('chart');

  return (
    <figure aria-busy={isFaded} className={clsx(s.root, className)} data-faded={isFaded}>
      <figcaption className={s.head}>
        <div className={s.titles}>
          <Text as='h3' className={s.title}>
            {title}
          </Text>

          {summary && (
            <Text as='p' size='xs' tone='muted'>
              {summary}
            </Text>
          )}
        </div>

        <Segmented
          options={[
            { value: 'chart', label: labels.chart },
            { value: 'table', label: labels.table }
          ]}
          aria-label={labels.view}
          className={s.toggle}
          value={view}
          onChange={setView}
        />
      </figcaption>

      {legend && legend.length > 0 && <ChartLegend items={legend} />}

      {view === 'chart' ? (
        <div className={s.body}>{children}</div>
      ) : (
        <ChartTableView caption={typeof title === 'string' ? title : undefined} table={table} />
      )}
    </figure>
  );
};
