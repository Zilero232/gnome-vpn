import type { LinePathsProps } from './LinePaths.types';

import { LINE } from '../../LineChart.constants';

import s from './LinePaths.module.scss';

export const LinePaths = ({ series, layout }: LinePathsProps) => (
  <g aria-hidden>
    {series.map((line, index) => {
      const last = line.values.length - 1;
      const endX = layout.x(last);
      const endY = layout.y(line.values.at(-1) ?? 0);

      return (
        <g key={line.key} className={s.series} data-slot={index + 1}>
          <path className={s.line} d={layout.paths[index]} />

          {last >= 0 && <circle className={s.marker} cx={endX} cy={endY} r={LINE.marker} />}

          {layout.hasEndLabels && (
            <text className={s.label} dominantBaseline='middle' x={endX + LINE.endLabelGap} y={endY}>
              {line.label}
            </text>
          )}
        </g>
      );
    })}
  </g>
);
