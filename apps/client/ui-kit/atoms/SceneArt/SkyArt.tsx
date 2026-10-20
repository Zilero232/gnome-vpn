import { GNOME_COLORS as C } from '@/shared/config';

import { SCENE_STARS } from './SceneArt.constants';

export const SkyArt = () => (
  <g>
    <rect fill={C.night} height='460' width='400' />

    {SCENE_STARS.map(({ x, y, r }, index) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} data-part='star' fill={index % 3 === 1 ? C.hat : C.star} r={r} />
    ))}

    <circle cx='312' cy='84' fill={C.nose} r='24' />
    <circle cx='323' cy='75' fill={C.night} r='21' />
  </g>
);
