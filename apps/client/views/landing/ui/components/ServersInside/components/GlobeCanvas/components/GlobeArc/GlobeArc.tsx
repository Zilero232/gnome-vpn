'use client';

import type { Mesh } from 'three';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { QuadraticBezierCurve3, TubeGeometry, Vector3 } from 'three';

import { GNOME_COLORS } from '@/shared/config';

import type { GlobeArcProps } from './GlobeArc.types';

import { GLOBE } from '../../../../../../../lib';
import { GLOBE_SCENE } from '../../GlobeCanvas.constants';

export const GlobeArc = ({ from, to, lift, index }: GlobeArcProps) => {
  const travellerRef = useRef<Mesh>(null);

  const { curve, geometry } = useMemo(() => {
    const middle = new Vector3()
      .addVectors(from, to)
      .normalize()
      .multiplyScalar(GLOBE.radius * lift);

    const path = new QuadraticBezierCurve3(from, middle, to);

    return { curve: path, geometry: new TubeGeometry(path, GLOBE_SCENE.arcSegments, GLOBE_SCENE.arcWidth, 6, false) };
  }, [from, to, lift]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    travellerRef.current?.position.copy(curve.getPoint((clock.elapsedTime * GLOBE_SCENE.travelSpeed + index * 0.37) % 1));
  });

  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={GNOME_COLORS.hatShade} />
      </mesh>
      <mesh ref={travellerRef} position={from}>
        <sphereGeometry args={[0.04, 10, 8]} />
        <meshBasicMaterial color={GNOME_COLORS.hat} />
      </mesh>
    </group>
  );
};
