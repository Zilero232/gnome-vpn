import { GNOME_COLORS as C } from '@/shared/config';

import type { GnomeArtProps } from './SceneArt.types';

export const GnomeArt = ({ hasLantern = true }: GnomeArtProps = {}) => (
  <g>
    <g transform='translate(52 96) scale(0.78)'>
      <ellipse cx='176' cy='384' fill={C.eye} opacity='0.3' rx='76' ry='8' />
      <ellipse cx='150' cy='380' fill={C.boots} rx='24' ry='11' />
      <ellipse cx='202' cy='380' fill={C.boots} rx='24' ry='11' />
      <path d='M116 374c4-72 22-118 60-128 38 10 56 56 60 128H116Z' fill={C.tunic} />
      <rect fill={C.belt} height='13' rx='3' width='112' x='120' y='330' />
      <rect height='15' rx='3' stroke={C.hat} strokeWidth='3' width='20' x='166' y='329' />
      <path d='M130 262c-18 14-24 30-20 48' stroke={C.tunic} strokeLinecap='round' strokeWidth='20' />
      <circle cx='111' cy='312' fill={C.nose} r='10' />
      <path d='M176 200h52c4 0 6 3 6 7 0 62-26 116-58 116s-58-54-58-116c0-4 2-7 6-7h52Z' fill={C.beard} />
      <g data-part='eyes'>
        <circle cx='154' cy='228' fill={C.eye} r='6.5' />
        <circle cx='198' cy='228' fill={C.eye} r='6.5' />
      </g>
      <ellipse cx='142' cy='246' fill={C.cheek} opacity='0.55' rx='9' ry='5' />
      <ellipse cx='210' cy='246' fill={C.cheek} opacity='0.55' rx='9' ry='5' />
      <ellipse cx='176' cy='250' fill={C.nose} rx='16' ry='13' />
      <path d='M176 30 116 190h120L176 30Z' fill={C.hat} />
      <path d='M176 30 148 104l32 86h56L176 30Z' fill={C.hatShade} />
      <rect fill={C.beard} height='26' rx='13' width='144' x='104' y='180' />
      <circle cx='176' cy='30' fill={C.beard} r='15' />
      <path d='M224 268c20 6 34 18 40 34' stroke={C.tunic} strokeLinecap='round' strokeWidth='20' />
      {hasLantern && (
        <>
          <g data-part='glow'>
            <defs>
              <radialGradient id='scene-lantern-glow'>
                <stop offset='0' stopColor={C.light} stopOpacity='0.42' />
                <stop offset='0.45' stopColor={C.light} stopOpacity='0.16' />
                <stop offset='1' stopColor={C.light} stopOpacity='0' />
              </radialGradient>
            </defs>
            <circle cx='268' cy='344' fill='url(#scene-lantern-glow)' r='64' />
          </g>
          <g data-part='lantern'>
            <path d='M256 318c0-14 24-14 24 0' stroke={C.metal} strokeWidth='4' />
            <rect fill={C.metal} height='8' rx='3' width='34' x='251' y='316' />
            <rect fill={C.light} height='36' rx='6' width='26' x='255' y='324' />
            <ellipse cx='268' cy='344' data-part='flame' fill={C.flame} rx='4.5' ry='8' />
            <rect fill={C.metal} height='8' rx='3' width='34' x='251' y='358' />
          </g>
        </>
      )}
      <circle cx='268' cy='306' fill={C.nose} r='11' />
    </g>
  </g>
);
