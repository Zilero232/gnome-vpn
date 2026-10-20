'use client';

import type { ArmProps } from './Arm.types';

import { limbPose } from '../../../../../../../lib/three';
import { useMaterials } from '../../../../../../../model/three';
import { GNOME_RIG } from '../../GnomeCanvas.constants';

export const Arm = ({ ref, side }: ArmProps) => {
  const materials = useMaterials();

  const shoulder = GNOME_RIG.shoulders[side];
  const { length, angle } = limbPose({ from: shoulder, to: GNOME_RIG.hands[side] });

  return (
    <group ref={ref} position={[shoulder[0], shoulder[1], GNOME_RIG.armDepth]} rotation={[GNOME_RIG.armReach, 0, angle]}>
      <mesh material={materials.tunic} position={[0, -length / 2, 0]}>
        <capsuleGeometry args={[0.11, length - 0.12, 4, 10]} />
      </mesh>
      <mesh material={materials.nose} position={[0, -length, 0]}>
        <sphereGeometry args={[0.1, 12, 10]} />
      </mesh>
    </group>
  );
};
