'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';

import { GNOME_COLORS } from '@/shared/config';

import type { GnomeCanvasProps } from './GnomeCanvas.types';

import { createToonMaterials, toonGradient } from '../../../../../lib/three';
import { GnomeMotionContext, MaterialsContext, useGnomeControls } from '../../../../../model/three';
import { GnomeModel, Island, NightSky, SceneRig } from './components';
import { GNOME_SCENE } from './GnomeCanvas.constants';

export const GnomeCanvas = ({ tier, isRunning, onReady, onFallback }: GnomeCanvasProps) => {
  const { motionRef, onTap } = useGnomeControls();

  const materials = useMemo(() => createToonMaterials(toonGradient()), []);

  useEffect(
    () => () => {
      Object.values(materials).forEach((material) => {
        material.dispose();
        ('gradientMap' in material ? material.gradientMap : null)?.dispose();
      });
    },
    [materials]
  );

  return (
    <Canvas
      aria-hidden
      flat
      camera={{ position: [...GNOME_SCENE.camera.position], fov: GNOME_SCENE.camera.fov }}
      dpr={[1, GNOME_SCENE.dpr[tier]]}
      frameloop={isRunning ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ camera }) => camera.lookAt(...GNOME_SCENE.target)}
      onPointerDown={onTap}
    >
      <MaterialsContext value={materials}>
        <GnomeMotionContext value={motionRef}>
          <hemisphereLight args={['#cfe8dc', GNOME_COLORS.boots, GNOME_SCENE.light.hemisphere]} />
          <directionalLight color='#fff1dc' intensity={GNOME_SCENE.light.directional} position={[3, 5, 4]} />
          <NightSky starCount={GNOME_SCENE.stars[tier]} />
          <group position={[0, GNOME_SCENE.lift, 0]} scale={GNOME_SCENE.scale}>
            <SceneRig onFallback={onFallback} onReady={onReady}>
              <Island grassCount={GNOME_SCENE.grass[tier]} />
              <GnomeModel />
            </SceneRig>
          </group>
        </GnomeMotionContext>
      </MaterialsContext>
    </Canvas>
  );
};
