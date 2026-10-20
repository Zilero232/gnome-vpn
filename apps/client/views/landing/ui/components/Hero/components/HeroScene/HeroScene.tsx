'use client';

import { clsx } from 'clsx';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { preload } from 'react-dom';

import { useWebglStage } from '@/shared/lib';

import { PhoneMock } from '../PhoneMock';
import { HERO_POSTER } from './HeroScene.constants';

import s from './HeroScene.module.scss';

const GnomeCanvas = dynamic(() => import('../GnomeCanvas').then((module) => module.GnomeCanvas), { ssr: false });

export const HeroScene = () => {
  const { ref, tier, isActive, isRunning } = useWebglStage({ waitFor: 'idle' });

  const [isReady, setIsReady] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  preload(HERO_POSTER.fallback, {
    as: 'image',
    fetchPriority: 'high',
    imageSrcSet: HERO_POSTER.avif,
    imageSizes: HERO_POSTER.sizes,
    type: 'image/avif'
  });

  return (
    <div ref={ref} className={s.root}>
      <div className={s.window}>
        <picture>
          <source sizes={HERO_POSTER.sizes} srcSet={HERO_POSTER.avif} type='image/avif' />
          <source sizes={HERO_POSTER.sizes} srcSet={HERO_POSTER.webp} type='image/webp' />
          <img
            alt=''
            className={s.poster}
            decoding='async'
            fetchPriority='high'
            height={HERO_POSTER.height}
            sizes={HERO_POSTER.sizes}
            src={HERO_POSTER.fallback}
            width={HERO_POSTER.width}
          />
        </picture>

        {isActive && !isFailed && tier !== 'off' && (
          <div className={clsx(s.stage, isReady && s.ready)}>
            <GnomeCanvas isRunning={isRunning} tier={tier} onFallback={() => setIsFailed(true)} onReady={() => setIsReady(true)} />
          </div>
        )}
      </div>

      <PhoneMock />
    </div>
  );
};
