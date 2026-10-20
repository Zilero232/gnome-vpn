'use client';

import { useEffect, useRef, useState } from 'react';

import type { UseWebglStageInput, WebglTier } from './webgl.types';

import { readEnvironment } from './read-environment';
import { webglTier } from './webgl';
import { WEBGL_STAGE } from './webgl.constants';

const onIdle = (callback: () => void) => {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(callback, { timeout: WEBGL_STAGE.idleTimeout });

    return () => window.cancelIdleCallback(id);
  }

  const id = setTimeout(callback, WEBGL_STAGE.idleTimeout);

  return () => clearTimeout(id);
};

const onFirstInteraction = (callback: () => void) => {
  const controller = new AbortController();

  const fire = () => {
    controller.abort();
    callback();
  };

  WEBGL_STAGE.interactionEvents.forEach((name) => window.addEventListener(name, fire, { passive: true, signal: controller.signal }));

  return () => controller.abort();
};

export const useWebglStage = ({ waitFor }: UseWebglStageInput) => {
  const ref = useRef<HTMLDivElement>(null);

  const [tier, setTier] = useState<WebglTier>('off');
  const [isArmed, setIsArmed] = useState(false);
  const [isNear, setIsNear] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);

  useEffect(() => {
    const nextTier = webglTier(readEnvironment());

    setTier(nextTier);

    if (nextTier === 'off') {
      return;
    }

    if (waitFor === 'near') {
      setIsArmed(true);

      return;
    }

    return nextTier === 'lite' ? onFirstInteraction(() => setIsArmed(true)) : onIdle(() => setIsArmed(true));
  }, [waitFor]);

  useEffect(() => {
    const node = ref.current;

    if (!node || tier === 'off') {
      return;
    }

    const near = new IntersectionObserver(([entry]) => entry.isIntersecting && setIsNear(true), { rootMargin: WEBGL_STAGE.nearMargin });
    const visible = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting));
    const onVisibility = () => setIsPageVisible(document.visibilityState === 'visible');

    near.observe(node);
    visible.observe(node);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      near.disconnect();
      visible.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [tier]);

  return { ref, tier, isActive: tier !== 'off' && isArmed && isNear, isRunning: isVisible && isPageVisible };
};
