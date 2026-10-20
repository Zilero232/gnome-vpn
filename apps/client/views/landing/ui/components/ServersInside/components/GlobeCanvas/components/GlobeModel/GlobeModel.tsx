'use client';

import type { Group } from 'three';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Vector3 } from 'three';

import { GNOME_COLORS } from '@/shared/config';

import type { GlobeModelProps } from './GlobeModel.types';

import { arcLift, GLOBE } from '../../../../../../../lib';
import { latLonToPoint } from '../../../../../../../lib/three';
import { GLOBE_SCENE } from '../../GlobeCanvas.constants';
import { GlobeArc } from '../GlobeArc';
import { GlobeDots } from '../GlobeDots';

const projected = new Vector3();
const facing = new Vector3();
const toCamera = new Vector3();

export const GlobeModel = ({ samples, markers, labels }: GlobeModelProps) => {
  const groupRef = useRef<Group>(null);

  const points = useMemo(
    () => markers.map(({ lat, lon }) => new Vector3().copy(latLonToPoint({ lat, lon, radius: GLOBE.radius * 1.01 }))),
    [markers]
  );

  const originIndex = markers.findIndex(({ isOrigin }) => isOrigin);

  useFrame(({ camera }) => {
    const root = groupRef.current;

    if (!root) {
      return;
    }

    points.forEach((point, index) => {
      const label = labels.current[index];

      if (!label) {
        return;
      }

      projected.copy(point).applyMatrix4(root.matrixWorld);
      facing.copy(projected).normalize();

      const isFront = facing.dot(toCamera.copy(camera.position).normalize()) > GLOBE.frontLimit;

      projected.project(camera);
      label.style.left = `${((projected.x + 1) / 2) * 100}%`;
      label.style.top = `${((1 - projected.y) / 2) * 100}%`;
      label.style.opacity = isFront ? '1' : '0';
    });
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[GLOBE.radius * 0.995, 64, 48]} />
        <meshBasicMaterial color={GLOBE_SCENE.core} />
      </mesh>
      <GlobeDots samples={samples} />

      {points.map((point, index) => (
        <mesh key={markers[index].key} position={point}>
          <sphereGeometry args={[markers[index].isOrigin ? 0.05 : 0.06, 14, 10]} />
          <meshBasicMaterial color={markers[index].isOrigin ? GNOME_COLORS.nose : GNOME_COLORS.hat} />
        </mesh>
      ))}

      {originIndex >= 0 &&
        points.map(
          (point, index) =>
            index !== originIndex && (
              <GlobeArc
                key={markers[index].key}
                from={points[originIndex]}
                index={index}
                lift={arcLift({ from: markers[originIndex], to: markers[index] })}
                to={point}
              />
            )
        )}
    </group>
  );
};
