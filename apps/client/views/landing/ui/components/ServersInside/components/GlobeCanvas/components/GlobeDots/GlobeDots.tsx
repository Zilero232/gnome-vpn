'use client';

import type { InstancedMesh } from 'three';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { MeshBasicMaterial, Object3D } from 'three';

import { GNOME_COLORS } from '@/shared/config';

import type { GlobeDotsProps } from './GlobeDots.types';

import { GLOBE, landDots } from '../../../../../../../lib';
import { GLOBE_SCENE } from '../../GlobeCanvas.constants';
import { LIMB_FADE_VERTEX } from './GlobeDots.constants';

export const GlobeDots = ({ samples }: GlobeDotsProps) => {
  const meshRef = useRef<InstancedMesh>(null);

  const dots = useMemo(() => landDots(samples), [samples]);

  const material = useMemo(() => {
    const next = new MeshBasicMaterial({ color: GNOME_COLORS.hatShade });

    next.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', LIMB_FADE_VERTEX);
    };

    return next;
  }, []);

  useEffect(() => () => material.dispose(), [material]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    const dummy = new Object3D();

    if (!mesh) {
      return;
    }

    dots.forEach(({ x, y, z }, index) => {
      dummy.position.set(x * GLOBE.radius, y * GLOBE.radius, z * GLOBE.radius);
      dummy.lookAt(x * GLOBE.radius * 2, y * GLOBE.radius * 2, z * GLOBE.radius * 2);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  }, [dots]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, material, dots.length]}>
      <circleGeometry args={[GLOBE_SCENE.dotRadius, 8]} />
    </instancedMesh>
  );
};
