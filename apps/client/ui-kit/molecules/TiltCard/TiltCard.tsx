'use client';

import type { PointerEvent } from 'react';

import { motion, useReducedMotion, useSpring } from 'motion/react';

import { SPRING } from '@/shared/lib';

import type { TiltCardProps } from './TiltCard.types';

import { TILT } from './TiltCard.constants';

export const TiltCard = ({ as = 'div', className, children }: TiltCardProps) => {
  const isReduced = useReducedMotion();

  const rotateX = useSpring(0, SPRING.tilt);
  const rotateY = useSpring(0, SPRING.tilt);

  const Tag = motion[as];

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (isReduced || event.pointerType !== 'mouse') {
      return;
    }

    const box = event.currentTarget.getBoundingClientRect();

    rotateY.set(((event.clientX - box.left) / box.width - 0.5) * 2 * TILT.maxDegrees);
    rotateX.set(-((event.clientY - box.top) / box.height - 0.5) * 2 * TILT.maxDegrees);
  };

  const onPointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <Tag
      className={className}
      style={{ rotateX, rotateY, transformPerspective: TILT.perspective }}
      transition={SPRING.snappy}
      whileHover={{ y: TILT.lift }}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
    >
      {children}
    </Tag>
  );
};
