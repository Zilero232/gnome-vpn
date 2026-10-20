'use client';

import type { Group } from 'three';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MathUtils } from 'three';

import type { SceneRigProps } from './SceneRig.types';

import { useAdaptiveQuality, useGnomeMotion } from '../../../../../../../model/three';
import { GNOME_SCENE } from '../../GnomeCanvas.constants';

export const SceneRig = ({ children, onReady, onFallback }: SceneRigProps) => {
  const motionRef = useGnomeMotion();

  const rigRef = useRef<Group>(null);
  const isReportedRef = useRef(false);

  useAdaptiveQuality({ onFallback });

  useFrame((_, delta) => {
    const group = rigRef.current;
    const { pointer } = motionRef.current;

    if (!group) {
      return;
    }

    const scroll = Math.min(window.scrollY / window.innerHeight, 1);
    const turn = GNOME_SCENE.restTurn + pointer.x * GNOME_SCENE.pointerTurn - scroll * GNOME_SCENE.scrollTurn;

    group.rotation.y = MathUtils.damp(group.rotation.y, turn, GNOME_SCENE.damping, delta);
    group.rotation.x = MathUtils.damp(group.rotation.x, pointer.y * GNOME_SCENE.pointerTilt, GNOME_SCENE.damping, delta);

    if (!isReportedRef.current) {
      isReportedRef.current = true;
      requestAnimationFrame(onReady);
    }
  });

  return (
    <group ref={rigRef} rotation={[0, GNOME_SCENE.restTurn, 0]}>
      {children}
    </group>
  );
};
