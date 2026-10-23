import type { LineCrosshairProps } from './LineCrosshair.types';

import { LINE } from '../../LineChart.constants';

import s from './LineCrosshair.module.scss';

export const LineCrosshair = ({ series, layout, active }: LineCrosshairProps) => {
  const x = layout.x(active);

  return (
    <g aria-hidden>
      <line className={s.rule} x1={x} x2={x} y1={layout.box.top} y2={layout.box.bottom} />

      {series.map((line, index) => (
        <circle key={line.key} className={s.marker} cx={x} cy={layout.y(line.values.at(active) ?? 0)} data-slot={index + 1} r={LINE.marker} />
      ))}
    </g>
  );
};
