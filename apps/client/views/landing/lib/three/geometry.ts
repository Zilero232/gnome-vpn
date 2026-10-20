import { ConeGeometry } from 'three';

import type { BeardWedgeInput } from './three.types';

export const beardWedge = ({ radius, height, depth, lean }: BeardWedgeInput) => {
  const geometry = new ConeGeometry(radius, height, 24, 8);
  const position = geometry.attributes.position;

  geometry.rotateX(Math.PI);

  for (let index = 0; index < position.count; index += 1) {
    const drop = (height / 2 - position.getY(index)) / height;

    position.setZ(index, position.getZ(index) * depth + lean[0] + (lean[1] - lean[0]) * drop);
  }

  geometry.computeVertexNormals();

  return geometry;
};
