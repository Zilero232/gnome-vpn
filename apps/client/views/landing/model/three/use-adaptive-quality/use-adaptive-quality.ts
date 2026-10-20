'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';

import type { UseAdaptiveQualityInput } from './use-adaptive-quality.types';

import { QUALITY } from './use-adaptive-quality.constants';

export const useAdaptiveQuality = ({ onFallback }: UseAdaptiveQualityInput) => {
  const setDpr = useThree((state) => state.setDpr);
  const dpr = useThree((state) => state.viewport.dpr);

  const sampleRef = useRef({ frames: 0, elapsed: 0, isLowered: false });

  useFrame((_, delta) => {
    const current = sampleRef.current;

    current.frames += 1;
    current.elapsed += delta;

    if (current.elapsed < QUALITY.windowSeconds) {
      return;
    }

    const fps = current.frames / current.elapsed;

    current.frames = 0;
    current.elapsed = 0;

    if (fps < QUALITY.fallbackFps && current.isLowered) {
      onFallback();

      return;
    }

    if (fps < QUALITY.lowFps && dpr > QUALITY.minDpr) {
      current.isLowered = true;
      setDpr(QUALITY.minDpr);
    }
  });
};
