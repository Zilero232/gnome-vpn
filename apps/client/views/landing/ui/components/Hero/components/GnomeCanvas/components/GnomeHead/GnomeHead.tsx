'use client';

import type { Group } from 'three';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MathUtils } from 'three';

import { useGnomeMotion, useMaterials } from '../../../../../../../model/three';
import { GNOME_RIG, GNOME_SCENE, HAT } from '../../GnomeCanvas.constants';
import { Hat } from '../Hat';
import { BLINK, HEAD } from './GnomeHead.constants';

const SIDES = [-1, 1] as const;

export const GnomeHead = () => {
  const materials = useMaterials();
  const motionRef = useGnomeMotion();

  const headRef = useRef<Group>(null);
  const eyesRef = useRef<Group>(null);

  useFrame(({ clock }, delta) => {
    const { pointer } = motionRef.current;

    if (headRef.current) {
      headRef.current.rotation.y = MathUtils.damp(headRef.current.rotation.y, pointer.x * GNOME_RIG.headTurn, GNOME_SCENE.damping * 1.6, delta);
      headRef.current.rotation.x = MathUtils.damp(headRef.current.rotation.x, pointer.y * GNOME_RIG.headTilt, GNOME_SCENE.damping * 1.6, delta);
    }

    if (eyesRef.current) {
      eyesRef.current.position.x = MathUtils.damp(eyesRef.current.position.x, pointer.x * GNOME_RIG.eyeShift, GNOME_SCENE.damping * 3, delta);
      eyesRef.current.position.y = HEAD.eyes.y - pointer.y * GNOME_RIG.eyeShift * 0.6;
      eyesRef.current.scale.y = (clock.elapsedTime + BLINK.offset) % BLINK.period < BLINK.length ? 0.15 : 1;
    }
  });

  return (
    <group ref={headRef} position={[0, GNOME_RIG.neck, 0]}>
      <mesh material={materials.beard} position={[0, HEAD.centre, 0]}>
        <sphereGeometry args={[HEAD.radius, 24, 18]} />
      </mesh>
      <group ref={eyesRef} position={[0, HEAD.eyes.y, HEAD.eyes.z]}>
        {SIDES.map((side) => (
          <mesh key={side} material={materials.eye} position={[side * HEAD.eyes.x, 0, 0]}>
            <sphereGeometry args={[HEAD.eyes.radius, 12, 10]} />
          </mesh>
        ))}
      </group>
      {SIDES.map((side) => (
        <mesh key={side} material={materials.cheek} position={[side * HEAD.cheeks.x, HEAD.cheeks.y, HEAD.cheeks.z]} scale={[1, 0.6, 0.4]}>
          <sphereGeometry args={[HEAD.cheeks.radius, 12, 8]} />
        </mesh>
      ))}
      <mesh material={materials.nose} position={[0, HEAD.nose.y, HEAD.nose.z]}>
        <sphereGeometry args={[HEAD.nose.radius, 16, 12]} />
      </mesh>
      <group position={[0, HAT.base - GNOME_RIG.neck, 0]}>
        <Hat />
      </group>
    </group>
  );
};
