'use client';

import { AnimatePresence, motion } from 'motion/react';

import type { IconSwapProps } from './IconSwap.types';

import { ICON, SPARK, SPARKS } from './IconSwap.motion';

import s from './IconSwap.module.scss';

export const IconSwap = ({ isActive, idle, active }: IconSwapProps) => (
  <span aria-hidden className={s.root}>
    <AnimatePresence initial={false} mode='popLayout'>
      <motion.span key={isActive ? 'active' : 'idle'} animate='animate' className={s.icon} exit='exit' initial='initial' variants={ICON}>
        {isActive ? active : idle}
      </motion.span>
    </AnimatePresence>

    {isActive &&
      SPARKS.map((spark) => (
        <motion.span key={`${spark.x}-${spark.y}`} animate='animate' className={s.spark} custom={spark} initial='initial' variants={SPARK} />
      ))}
  </span>
);
