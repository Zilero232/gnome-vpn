import { GNOME_COLORS as C } from '@/shared/config';

import { SCENE_TUFTS } from './SceneArt.constants';

export const GroundArt = () => (
  <g>
    <path d='M-30 424c120-26 300-30 460-8v60H-30v-52Z' fill={C.ground} />

    {SCENE_TUFTS.map(({ x, y }) => (
      <path key={x} d={`M${x - 10} ${y}q4-16 6-2q2-20 6 0q4-14 8 2Z`} fill={C.grass} />
    ))}

    <rect fill={C.beard} height='22' rx='5' width='12' x='58' y='408' />
    <path d='M42 412c0-18 15-28 22-28s22 10 22 28H42Z' fill={C.tunic} />
    <circle cx='56' cy='400' fill={C.beard} r='3.5' />
    <circle cx='70' cy='395' fill={C.beard} r='2.5' />

    <rect fill={C.beard} height='14' rx='4' width='8' x='350' y='416' />
    <path d='M340 420c0-12 10-18 14-18s14 6 14 18h-28Z' fill={C.nose} />
  </g>
);
