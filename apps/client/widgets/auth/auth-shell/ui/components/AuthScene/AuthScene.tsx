'use client';

import { clsx } from 'clsx';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';

import { GNOME_COLORS as C } from '@/shared/config';
import { SPRING } from '@/shared/lib';
import { GnomeArt, GroundArt, HillsArt, SCENE_VIEWBOX, SkyArt } from '@/ui-kit';

import type { AuthSceneProps } from './AuthScene.types';

import { SceneProps } from '../SceneProps';
import { AUTH_SCENE_DEPTH } from './AuthScene.constants';

import s from './AuthScene.module.scss';

export const AuthScene = ({ pose, isDoorOpen, isEntering, className }: AuthSceneProps) => {
  const isReduced = useReducedMotion();

  const pointer = useMotionValue(0);
  const smooth = useSpring(pointer, SPRING.soft);
  const back = useTransform(smooth, (value) => value * -AUTH_SCENE_DEPTH.back);
  const middle = useTransform(smooth, (value) => value * -AUTH_SCENE_DEPTH.middle);
  const front = useTransform(smooth, (value) => value * -AUTH_SCENE_DEPTH.front);

  useEffect(() => {
    if (isReduced || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const onMove = (event: PointerEvent) => pointer.set(event.clientX / window.innerWidth - 0.5);

    window.addEventListener('pointermove', onMove, { passive: true });

    return () => window.removeEventListener('pointermove', onMove);
  }, [isReduced, pointer]);

  return (
    <div aria-hidden className={clsx(s.root, className)} data-entering={isEntering} data-open={isDoorOpen || isEntering}>
      <motion.svg className={s.layer} style={{ x: back }} viewBox={SCENE_VIEWBOX}>
        {SkyArt()}
        {HillsArt()}
      </motion.svg>
      <motion.svg className={s.layer} style={{ x: middle }} viewBox={SCENE_VIEWBOX}>
        <path d='M290 396v-106a40 40 0 0 1 80 0v106Z' fill={C.light} />
        <g className={s.door}>
          <path d='M294 396v-104a36 36 0 0 1 72 0v104Z' fill={C.door} />
          <circle cx='356' cy='350' fill={C.light} r='4' />
        </g>
        <path d='M290 396v-106a40 40 0 0 1 80 0v106' fill='none' stroke={C.ground} strokeWidth='6' />
      </motion.svg>
      <motion.svg className={s.layer} style={{ x: front }} viewBox={SCENE_VIEWBOX}>
        <g className={s.gnome}>
          {GnomeArt({ hasLantern: pose === 'welcome' })}
          <SceneProps pose={pose} />
        </g>
        {GroundArt()}
      </motion.svg>
    </div>
  );
};
