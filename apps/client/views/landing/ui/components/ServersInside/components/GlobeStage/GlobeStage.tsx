'use client';

import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';

import { useWebglStage } from '@/shared/lib';

import { GlobePoster } from '../GlobePoster';
import { MARKER_LABELS, MARKERS } from './GlobeStage.constants';

import s from './GlobeStage.module.scss';

const GlobeCanvas = dynamic(() => import('../GlobeCanvas').then((module) => module.GlobeCanvas), { ssr: false });

export const GlobeStage = () => {
  const t = useTranslations('landing');
  const { ref, tier, isActive, isRunning } = useWebglStage({ waitFor: 'near' });

  const labelsRef = useRef<(HTMLElement | null)[]>([]);

  const [isReady, setIsReady] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  return (
    <div aria-hidden ref={ref} className={s.root}>
      <GlobePoster className={clsx(s.poster, isReady && s.covered)} />

      {isActive && !isFailed && tier !== 'off' && (
        <div className={clsx(s.stage, isReady && s.ready)}>
          <GlobeCanvas
            isRunning={isRunning}
            labels={labelsRef}
            markers={MARKERS}
            tier={tier}
            onFallback={() => setIsFailed(true)}
            onReady={() => setIsReady(true)}
          />
        </div>
      )}

      {MARKERS.map((marker, index) => (
        <span
          key={marker.key}
          ref={(node) => {
            labelsRef.current[index] = node;
          }}
          className={clsx(s.label, s[MARKER_LABELS[index].side], marker.isOrigin && s.origin)}
          style={MARKER_LABELS[index].spot}
        >
          {marker.isOrigin ? t('inside.you') : t(`locations.${marker.key}City`)}
        </span>
      ))}
    </div>
  );
};
