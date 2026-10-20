'use client';

import type { InstancedMesh } from 'three';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { Object3D } from 'three';

import type { IslandProps } from './Island.types';

import { scatterOnDisc, softDisc } from '../../../../../../../lib/three';
import { useMaterials } from '../../../../../../../model/three';
import { ISLAND } from './Island.constants';

export const Island = ({ grassCount }: IslandProps) => {
  const materials = useMaterials();

  const grassRef = useRef<InstancedMesh>(null);

  const [shadow, drop] = useMemo(() => [softDisc('rgba(10,24,18,0.55)'), softDisc('rgba(8,20,15,0.6)')], []);

  useLayoutEffect(() => {
    const mesh = grassRef.current;
    const dummy = new Object3D();

    if (!mesh) {
      return;
    }

    scatterOnDisc({ count: grassCount, ...ISLAND.grass }).forEach(({ x, z, scale, turn }, index) => {
      dummy.position.set(x, 0.09 * scale, z);
      dummy.rotation.set(0, turn, (turn - 1.5) * 0.15);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  }, [grassCount]);

  return (
    <group>
      <mesh material={materials.grass} position={[0, -0.09, 0]}>
        <cylinderGeometry args={[ISLAND.radius, ISLAND.radius * 0.97, 0.18, 10]} />
      </mesh>
      <mesh material={materials.earth} position={[0, -0.18 - ISLAND.depth / 2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[ISLAND.radius * 0.97, ISLAND.depth, 10]} />
      </mesh>
      <mesh position={[0, 0.006, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.9, 1.5]} />
        <meshBasicMaterial transparent depthWrite={false} map={shadow} />
      </mesh>

      <mesh position={[0, ISLAND.drop.y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ISLAND.drop.width, ISLAND.drop.depth]} />
        <meshBasicMaterial transparent depthWrite={false} map={drop} />
      </mesh>

      <instancedMesh ref={grassRef} args={[undefined, materials.grass, grassCount]}>
        <coneGeometry args={[0.05, 0.2, 4]} />
      </instancedMesh>

      {ISLAND.mushrooms.map(({ position, scale }) => (
        <group key={position.join()} position={[...position]} scale={scale}>
          <mesh material={materials.beard} position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 0.28, 10]} />
          </mesh>
          <mesh material={materials.tunic} position={[0, 0.26, 0]}>
            <sphereGeometry args={[0.22, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh material={materials.beard} position={[0.08, 0.43, 0.1]}>
            <sphereGeometry args={[0.035, 8, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
