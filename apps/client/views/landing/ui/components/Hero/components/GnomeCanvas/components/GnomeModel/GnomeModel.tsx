'use client';

import type { Group } from 'three';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { LatheGeometry, Vector2 } from 'three';

import { beardWedge, hopHeight, limbPose, nextAction, phase, swell } from '../../../../../../../lib/three';
import { useGnomeMotion, useMaterials } from '../../../../../../../model/three';
import { GNOME_RIG } from '../../GnomeCanvas.constants';
import { Arm } from '../Arm';
import { GnomeHead } from '../GnomeHead';
import { Lantern } from '../Lantern';
import { BEARD, BODY_PROFILE, BREATH } from './GnomeModel.constants';

const LEFT_ARM = limbPose({ from: GNOME_RIG.shoulders.left, to: GNOME_RIG.hands.left });
const RIGHT_ARM = limbPose({ from: GNOME_RIG.shoulders.right, to: GNOME_RIG.hands.right });

export const GnomeModel = () => {
  const materials = useMaterials();
  const motionRef = useGnomeMotion();

  const bodyRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);

  const [bodyGeometry, beardGeometry] = useMemo(
    () => [
      new LatheGeometry(
        BODY_PROFILE.map(([x, y]) => new Vector2(x, y)),
        28
      ),
      beardWedge(BEARD)
    ],
    []
  );

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const motion = motionRef.current;

    if (motion.isTapPending) {
      motion.isTapPending = false;
      motion.hopStart = time;
    }

    if (time >= motion.nextActionAt) {
      motion.action = nextAction(motion.action);
      motion.actionStart = time;
      motion.nextActionAt = time + GNOME_RIG.actionGap.min + Math.random() * GNOME_RIG.actionGap.spread;
    }

    const act = swell(phase({ time, start: motion.actionStart, duration: GNOME_RIG.actionSeconds }));
    const hop = hopHeight(phase({ time, start: motion.hopStart, duration: GNOME_RIG.hopSeconds }));

    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(time * BREATH.speed) * BREATH.bob + hop * GNOME_RIG.hopHeight;
      bodyRef.current.scale.y = 1 + Math.sin(time * BREATH.speed + 0.6) * BREATH.stretch;
    }

    if (leftArmRef.current) {
      const wave = motion.action === 'wave' ? act * (GNOME_RIG.wave.lift + Math.sin(time * 14) * GNOME_RIG.wave.wiggle) : 0;

      leftArmRef.current.rotation.z = LEFT_ARM.angle - wave - hop * 0.6;
    }

    if (rightArmRef.current) {
      rightArmRef.current.rotation.z = RIGHT_ARM.angle + (motion.action === 'lantern' ? act * GNOME_RIG.raise.lift : 0) + hop * 0.6;
    }
  });

  return (
    <group ref={bodyRef}>
      {[-0.22, 0.22].map((x) => (
        <mesh key={x} material={materials.boots} position={[x, 0.08, 0.08]} scale={[1.15, 0.6, 1.5]}>
          <sphereGeometry args={[0.19, 16, 12]} />
        </mesh>
      ))}
      <mesh geometry={bodyGeometry} material={materials.tunic} />
      <mesh material={materials.belt} position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.09, 28]} />
      </mesh>
      <mesh material={materials.buckle} position={[0, 0.5, 0.6]}>
        <boxGeometry args={[0.15, 0.12, 0.03]} />
      </mesh>
      <mesh geometry={beardGeometry} material={materials.beard} position={[0, BEARD.top - BEARD.height / 2, 0]} />
      <Arm ref={leftArmRef} side='left' />
      <Arm ref={rightArmRef} side='right' />
      <Lantern armRef={rightArmRef} />
      <GnomeHead />
    </group>
  );
};
