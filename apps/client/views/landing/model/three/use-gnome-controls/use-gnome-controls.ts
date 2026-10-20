'use client';

import { useEffect, useRef } from 'react';

import type { GnomeMotion } from '../gnome-motion';

import { GNOME_CONTROLS } from './use-gnome-controls.constants';

export const useGnomeControls = () => {
  const motionRef = useRef<GnomeMotion>({
    pointer: { x: 0, y: 0 },
    isTapPending: false,
    hopStart: Number.NEGATIVE_INFINITY,
    action: 'hat',
    actionStart: Number.NEGATIVE_INFINITY,
    nextActionAt: GNOME_CONTROLS.firstActionAt
  });

  useEffect(() => {
    if (!window.matchMedia(GNOME_CONTROLS.finePointer).matches) {
      return;
    }

    const onMove = (event: PointerEvent) => {
      motionRef.current.pointer.x = event.clientX / window.innerWidth - 0.5;
      motionRef.current.pointer.y = event.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener('pointermove', onMove, { passive: true });

    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const onTap = () => {
    motionRef.current.isTapPending = true;
  };

  return { motionRef, onTap };
};
