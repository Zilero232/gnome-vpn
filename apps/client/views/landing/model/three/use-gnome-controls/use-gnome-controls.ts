'use client';

import { useMediaQuery, useWindowEvent } from '@siberiacancode/reactuse';
import { useRef } from 'react';

import { FINE_POINTER_QUERY } from '@/shared/constants';

import type { GnomeMotion } from '../gnome-motion';

import { GNOME_CONTROLS } from './use-gnome-controls.constants';

export const useGnomeControls = () => {
  const isFinePointer = useMediaQuery(FINE_POINTER_QUERY);

  const motionRef = useRef<GnomeMotion>({
    pointer: { x: 0, y: 0 },
    isTapPending: false,
    hopStart: Number.NEGATIVE_INFINITY,
    action: 'hat',
    actionStart: Number.NEGATIVE_INFINITY,
    nextActionAt: GNOME_CONTROLS.firstActionAt
  });

  useWindowEvent(
    'pointermove',
    (event) => {
      motionRef.current.pointer.x = event.clientX / window.innerWidth - 0.5;
      motionRef.current.pointer.y = event.clientY / window.innerHeight - 0.5;
    },
    { passive: true, enabled: isFinePointer }
  );

  const onTap = () => {
    motionRef.current.isTapPending = true;
  };

  return { motionRef, onTap };
};
