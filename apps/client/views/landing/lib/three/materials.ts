import type { Texture } from 'three';

import { MeshBasicMaterial, MeshToonMaterial } from 'three';

import { GNOME_COLORS as C } from '@/shared/config';

export const createToonMaterials = (gradientMap: Texture) => {
  const toon = (color: string) => new MeshToonMaterial({ color, gradientMap });

  return {
    hat: toon(C.hat),
    hatShade: toon(C.hatShade),
    beard: toon(C.beard),
    nose: toon(C.nose),
    cheek: new MeshToonMaterial({ color: C.cheek, gradientMap, transparent: true, opacity: 0.6 }),
    eye: toon(C.eye),
    tunic: toon(C.tunic),
    belt: toon(C.belt),
    boots: toon(C.boots),
    metal: toon(C.metal),
    grass: toon(C.grass),
    hillNear: toon(C.hillNear),
    earth: toon(C.door),
    glass: new MeshBasicMaterial({ color: C.light }),
    buckle: new MeshBasicMaterial({ color: C.hat })
  };
};

export type ToonMaterials = ReturnType<typeof createToonMaterials>;
