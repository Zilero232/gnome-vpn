'use client';

import type { Group } from 'three';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { ConeGeometry } from 'three';

import { phase, springKick } from '../../../../../../../lib/three';
import { useGnomeMotion, useMaterials } from '../../../../../../../model/three';
import { GNOME_RIG, HAT } from '../../GnomeCanvas.constants';

const bentHalf = (thetaStart: number) => {
  const geometry = new ConeGeometry(HAT.radius, HAT.height, 28, 12, true, thetaStart, Math.PI);
  const position = geometry.attributes.position;

  for (let index = 0; index < position.count; index += 1) {
    const rise = (position.getY(index) + HAT.height / 2) / HAT.height;

    position.setX(index, position.getX(index) + HAT.bend * rise ** 2.4);
  }

  geometry.computeVertexNormals();

  return geometry;
};

export const Hat = () => {
  const materials = useMaterials();
  const motionRef = useGnomeMotion();

  const tipRef = useRef<Group>(null);

  const [light, shade] = useMemo(() => [bentHalf(Math.PI), bentHalf(0)], []);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const motion = motionRef.current;

    if (!tipRef.current) {
      return;
    }

    const flick = motion.action === 'hat' ? springKick(phase({ time, start: motion.actionStart, duration: GNOME_RIG.actionSeconds })) : 0;
    const bounce = springKick(phase({ time, start: motion.hopStart, duration: GNOME_RIG.actionSeconds }));

    tipRef.current.rotation.z = Math.sin(time * 1.3) * 0.035 - flick * 0.32 - bounce * 0.18;
  });

  return (
    <group>
      <mesh material={materials.beard} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[HAT.radius - 0.02, 0.1, 10, 32]} />
      </mesh>
      <group ref={tipRef}>
        <mesh geometry={light} material={materials.hat} position={[0, HAT.height / 2, 0]} />
        <mesh geometry={shade} material={materials.hatShade} position={[0, HAT.height / 2, 0]} />
        <mesh material={materials.beard} position={[HAT.bend, HAT.height + 0.04, 0]}>
          <sphereGeometry args={[0.13, 16, 12]} />
        </mesh>
      </group>
    </group>
  );
};
