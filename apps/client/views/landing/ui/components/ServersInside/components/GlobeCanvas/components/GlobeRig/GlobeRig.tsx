'use client';

import type { Group } from 'three';

import { useFrame, useThree } from '@react-three/fiber';
import { target, useEventListener } from '@siberiacancode/reactuse';
import { useRef } from 'react';
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

  useEventListener(target(element), 'pointerdown', (event) => {
    const state = dragRef.current;

    state.isDown = true;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    element.setPointerCapture(event.pointerId);
  });

  useEventListener(target(element), 'pointermove', (event) => {
    const state = dragRef.current;

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
  });

  useEventListener(target(element), 'pointerup', () => {
    dragRef.current.isDown = false;
  });

  useEventListener(target(element), 'pointercancel', () => {
    dragRef.current.isDown = false;
  });

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
