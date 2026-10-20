'use client';

import { motion } from 'motion/react';

import { GNOME_COLORS as C } from '@/shared/config';
import { IN_VIEW } from '@/shared/lib';

import { WAVE } from './WavingGnome.motion';

import s from './WavingGnome.module.scss';

export const WavingGnome = () => (
  <motion.svg aria-hidden className={s.root} initial='hidden' viewBox='0 0 256 256' viewport={IN_VIEW} whileInView='visible'>
    <defs>
      <clipPath id='waving-gnome-clip'>
        <circle cx='128' cy='128' r='128' />
      </clipPath>
    </defs>

    <g clipPath='url(#waving-gnome-clip)'>
      <circle cx='128' cy='128' fill={C.night} r='128' />
      <circle cx='52' cy='70' fill={C.star} r='3' />
      <circle cx='210' cy='58' fill={C.hat} r='2.5' />
      <path d='M54 262c6-50 30-76 74-80 44 4 68 30 74 80H54Z' fill={C.tunic} />
      <g transform='translate(128 104) scale(0.74) translate(-128 -128)'>
        <path d='M128 30 72 116h112L128 30Z' fill={C.hat} />
        <path d='M128 30 102 70l30 46h52L128 30Z' fill={C.hatShade} />
        <path d='M82 128h92c4 0 6 3 6 7 0 52-23 98-52 98s-52-46-52-98c0-4 2-7 6-7Z' fill={C.beard} />
        <circle className={s.eye} cx='108' cy='152' fill={C.eye} r='7.5' />
        <circle className={s.eye} cx='148' cy='152' fill={C.eye} r='7.5' />
        <ellipse cx='128' cy='176' fill={C.nose} rx='18' ry='14.5' />
        <rect fill={C.beard} height='22' rx='11' width='132' x='62' y='110' />
        <circle cx='128' cy='30' fill={C.beard} r='13' />
      </g>
    </g>

    <motion.g className={s.arm} variants={WAVE}>
      <path d='M180 222c16-18 26-40 30-66' stroke={C.tunic} strokeLinecap='round' strokeWidth='24' />
      <circle cx='211' cy='148' fill={C.nose} r='14' />
    </motion.g>
  </motion.svg>
);
