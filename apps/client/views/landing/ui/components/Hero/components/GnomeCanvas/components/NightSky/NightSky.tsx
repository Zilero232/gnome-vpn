'use client';

import type { PointsMaterial } from 'three';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { BufferAttribute, BufferGeometry } from 'three';

import { GNOME_COLORS } from '@/shared/config';

import type { NightSkyProps } from './NightSky.types';

import { scatterOnDisc } from '../../../../../../../lib/three';

export const NightSky = ({ starCount }: NightSkyProps) => {
  const materialRef = useRef<PointsMaterial>(null);

  const stars = useMemo(() => {
    const positions = scatterOnDisc({ count: starCount, innerRadius: 0, outerRadius: 1, seed: 5 }).flatMap(({ x, z, scale }) => [
      x * 7,
      2.2 + z * 3.2,
      -5 - scale * 2
    ]);

    const geometry = new BufferGeometry();

    geometry.setAttribute('position', new BufferAttribute(Float32Array.from(positions), 3));

    return geometry;
  }, [starCount]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.opacity = 0.75 + Math.sin(clock.elapsedTime * 1.7) * 0.2;
    }
  });

  return (
    <group>
      <points geometry={stars}>
        <pointsMaterial sizeAttenuation transparent ref={materialRef} color={GNOME_COLORS.star} size={0.06} />
      </points>
      <mesh position={[1.9, 3.1, -5]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color={GNOME_COLORS.nose} />
      </mesh>
      <mesh position={[2.08, 3.25, -4.99]}>
        <circleGeometry args={[0.46, 32]} />
        <meshBasicMaterial color={GNOME_COLORS.night} />
      </mesh>
    </group>
  );
};
