import { match } from 'ts-pattern';

import { GNOME_COLORS as C } from '@/shared/config';

import type { ScenePropsProps } from './SceneProps.types';

export const SceneProps = ({ pose }: ScenePropsProps) =>
  match(pose)
    .with('welcome', () => null)
    .with('key', () => (
      <g transform='translate(252 318) rotate(-35)'>
        <circle cx='0' cy='0' fill='none' r='9' stroke={C.light} strokeWidth='5' />
        <rect fill={C.light} height='5' rx='2' width='26' x='8' y='-2.5' />
        <rect fill={C.light} height='8' rx='1' width='4' x='26' y='2' />
        <rect fill={C.light} height='6' rx='1' width='4' x='19' y='2' />
      </g>
    ))
    .with('envelope', () => (
      <g transform='translate(238 318) rotate(-12)'>
        <rect fill={C.beard} height='24' rx='3' width='36' x='0' y='0' />
        <path d='M1 2l17 13L35 2' fill='none' stroke={C.door} strokeLinejoin='round' strokeWidth='2.5' />
        <circle cx='18' cy='15' fill={C.tunic} r='3.5' />
      </g>
    ))
    .exhaustive();
