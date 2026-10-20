import { GNOME_COLORS as C } from '@/shared/config';

export const HillsArt = () => (
  <g>
    <path d='M-30 318C40 262 120 250 196 282c62 26 130 4 234-40v240H-30V318Z' fill={C.hillFar} />
    <path d='M318 300v-20a24 24 0 0 1 48 0v20h-48Z' fill={C.door} />
    <path d='M318 300v-20a24 24 0 0 1 48 0v20' stroke={C.ground} strokeWidth='4' />
    <circle cx='356' cy='286' fill={C.light} r='3' />
    <circle cx='334' cy='252' data-part='window' fill={C.light} r='7' />
    <path d='M-30 372c90-46 250-58 460-22v130H-30V372Z' fill={C.hillNear} />
  </g>
);
