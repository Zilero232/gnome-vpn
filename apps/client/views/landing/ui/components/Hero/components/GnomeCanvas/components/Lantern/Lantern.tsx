'use client';

import type { Group, PointLight } from 'three';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

import { GNOME_COLORS } from '@/shared/config';

import type { LanternProps } from './Lantern.types';

import { limbPose, phase, swell } from '../../../../../../../lib/three';
import { useGnomeMotion, useMaterials } from '../../../../../../../model/three';
import { GNOME_RIG } from '../../GnomeCanvas.constants';
import { LANTERN } from './Lantern.constants';

const ARM = limbPose({ from: GNOME_RIG.shoulders.right, to: GNOME_RIG.hands.right });

export const Lantern = ({ armRef }: LanternProps) => {
  const materials = useMaterials();
  const motionRef = useGnomeMotion();

  const swingRef = useRef<Group>(null);
  const lightRef = useRef<PointLight>(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const motion = motionRef.current;
    const angle = armRef.current?.rotation.z ?? ARM.angle;
    const swing = swingRef.current;

    if (swing) {
      swing.position.set(
        GNOME_RIG.shoulders.right[0] + ARM.length * Math.sin(angle),
        GNOME_RIG.shoulders.right[1] - ARM.length * Math.cos(angle) * Math.cos(GNOME_RIG.armReach),
        GNOME_RIG.armDepth - ARM.length * Math.cos(angle) * Math.sin(GNOME_RIG.armReach)
      );

      swing.rotation.z = Math.sin(time * 1.1) * 0.12;
      swing.rotation.x = Math.sin(time * 0.8) * 0.05;
    }

    if (lightRef.current) {
      const raised = motion.action === 'lantern' ? swell(phase({ time, start: motion.actionStart, duration: GNOME_RIG.actionSeconds })) : 0;
      const tapped = phase({ time, start: motion.hopStart, duration: GNOME_RIG.actionSeconds });
      const flicker = Math.sin(time * 9) * LANTERN.light.flicker + Math.sin(time * 23) * LANTERN.light.flicker * 0.6;

      lightRef.current.intensity =
        LANTERN.light.base + flicker + raised * GNOME_RIG.flare.action + (tapped === null ? 0 : (1 - tapped) * GNOME_RIG.flare.tap);
    }
  });

  return (
    <group ref={swingRef}>
      <mesh material={materials.metal} position={[0, -0.055, 0]}>
        <torusGeometry args={[0.055, 0.012, 6, 16, Math.PI]} />
      </mesh>
      <mesh material={materials.metal} position={[0, -0.085, 0]}>
        <cylinderGeometry args={[0.045, 0.1, 0.05, 8]} />
      </mesh>
      <mesh material={materials.glass} position={[0, LANTERN.glass.y, 0]}>
        <cylinderGeometry args={[LANTERN.glass.radius, LANTERN.glass.radius, LANTERN.glass.height, 8]} />
      </mesh>
      {LANTERN.bars.map((turn) => (
        <mesh
          key={turn}
          material={materials.metal}
          position={[Math.cos(turn) * LANTERN.barRadius, LANTERN.glass.y, Math.sin(turn) * LANTERN.barRadius]}
        >
          <boxGeometry args={[0.018, LANTERN.glass.height, 0.018]} />
        </mesh>
      ))}
      <mesh material={materials.metal} position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.1, 0.085, 0.04, 8]} />
      </mesh>
      <pointLight
        ref={lightRef}
        color={GNOME_COLORS.light}
        decay={LANTERN.light.decay}
        distance={LANTERN.light.distance}
        position={[0, LANTERN.glass.y, 0.05]}
      />
    </group>
  );
};
