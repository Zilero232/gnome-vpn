'use client';

import { Canvas } from '@react-three/fiber';

import type { GlobeCanvasProps } from './GlobeCanvas.types';

import { GLOBE } from '../../../../../lib';
import { GlobeModel, GlobeRig } from './components';
import { GLOBE_SCENE } from './GlobeCanvas.constants';

import s from './GlobeCanvas.module.scss';

export const GlobeCanvas = ({ tier, isRunning, markers, labels, onReady, onFallback }: GlobeCanvasProps) => (
  <Canvas
    aria-hidden
    flat
    camera={{ position: [0, 0, GLOBE.distance], fov: GLOBE.fov }}
    className={s.root}
    dpr={[1, GLOBE_SCENE.dpr[tier]]}
    frameloop={isRunning ? 'always' : 'never'}
    gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
  >
    <GlobeRig onFallback={onFallback} onReady={onReady}>
      <GlobeModel labels={labels} markers={markers} samples={GLOBE_SCENE.samples[tier]} />
    </GlobeRig>
  </Canvas>
);
