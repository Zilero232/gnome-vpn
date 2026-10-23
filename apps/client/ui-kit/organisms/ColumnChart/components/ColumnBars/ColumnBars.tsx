import type { ColumnBarsProps } from './ColumnBars.types';

import { clampLabel, textWidth } from '../../../../molecules';
import { COLUMN } from '../../ColumnChart.constants';
import { columnPath } from '../../ColumnChart.helpers';

import s from './ColumnBars.module.scss';

export const ColumnBars = ({ values, layout, active, formatValue }: ColumnBarsProps) => {
  const max = Math.max(...values, 0);
  const maxIndex = values.indexOf(max);
  const maxText = formatValue(max);

  return (
    <g aria-hidden>
      {values.map((value, index) => (
        <path
          // eslint-disable-next-line react/no-array-index-key -- columns are positional: the index is the day
          key={index}
          className={s.bar}
          d={columnPath({ x: layout.left(index), y: layout.y(value), width: layout.barWidth, base: layout.box.bottom })}
          data-active={index === active}
        />
      ))}

      {max > 0 && maxIndex !== active && (
        <text
          className={s.value}
          textAnchor='middle'
          x={clampLabel({ x: layout.center(maxIndex), half: textWidth(maxText) / 2, box: layout.box })}
          y={layout.y(max) - COLUMN.valueOffset}
        >
          {maxText}
        </text>
      )}
    </g>
  );
};
