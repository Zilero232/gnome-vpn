'use client';

import type { RefObject } from 'react';

import { createContext, use } from 'react';

import type { GnomeMotion } from './gnome-motion.types';

export const GnomeMotionContext = createContext<RefObject<GnomeMotion> | null>(null);

export const useGnomeMotion = () => {
  const motion = use(GnomeMotionContext);

  if (!motion) {
    throw new Error('useGnomeMotion must be used inside GnomeMotionContext');
  }

  return motion;
};
