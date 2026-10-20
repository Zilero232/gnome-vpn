'use client';

import type { Group } from 'three';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { MathUtils } from 'three';

import type { GlobeRigProps } from './GlobeRig.types';

import { GLOBE_PITCH, GLOBE_YAW } from '../../../../../../../lib';
import { useAdaptiveQuality } from '../../../../../../../model/three';
import { GLOBE_SCENE } from '../../GlobeCanvas.constants';

export const GlobeRig = ({ children, onReady, onFallback }: GlobeRigProps) => {
  const element = useThree((state) => state.gl.domElement);

  const rigRef = useRef<Group>(null);
  const dragRef = useRef({ yaw: 0, pitch: 0, velocity: 0, lastX: 0, lastY: 0, isDown: false });
  const isReportedRef = useRef(false);

  useAdaptiveQuality({ onFallback });

  useEffect(() => {
    const state = dragRef.current;

    const onDown = (event: PointerEvent) => {
      state.isDown = true;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      element.setPointerCapture(event.pointerId);
    };

    const onMove = (event: PointerEvent) => {
      if (!state.isDown) {
        return;
      }

      state.velocity = (event.clientX - state.lastX) * GLOBE_SCENE.dragSpeed;

      state.pitch = MathUtils.clamp(
        state.pitch + (event.clientY - state.lastY) * GLOBE_SCENE.dragSpeed,
        -GLOBE_SCENE.pitchLimit,
        GLOBE_SCENE.pitchLimit
      );

      state.lastX = event.clientX;
      state.lastY = event.clientY;
    };

    const onUp = () => {
      state.isDown = false;
    };

    element.addEventListener('pointerdown', onDown);
    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerup', onUp);
    element.addEventListener('pointercancel', onUp);

    return () => {
      element.removeEventListener('pointerdown', onDown);
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerup', onUp);
      element.removeEventListener('pointercancel', onUp);
    };
  }, [element]);

  useFrame(({ clock }) => {
    const group = rigRef.current;
    const state = dragRef.current;

    if (!group) {
      return;
    }

    state.yaw += state.velocity;
    state.velocity *= state.isDown ? 0.5 : GLOBE_SCENE.friction;
    group.rotation.set(GLOBE_PITCH + state.pitch, GLOBE_YAW + state.yaw + Math.sin(clock.elapsedTime * GLOBE_SCENE.swaySpeed) * GLOBE_SCENE.sway, 0);

    if (!isReportedRef.current) {
      isReportedRef.current = true;
      requestAnimationFrame(onReady);
    }
  });

  return (
    <group ref={rigRef} rotation={[GLOBE_PITCH, GLOBE_YAW, 0]}>
      {children}
    </group>
  );
};
