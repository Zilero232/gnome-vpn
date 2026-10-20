'use client';

import { createContext, use } from 'react';

import type { ToonMaterials } from '../../../lib/three';

export const MaterialsContext = createContext<ToonMaterials | null>(null);

export const useMaterials = () => {
  const materials = use(MaterialsContext);

  if (!materials) {
    throw new Error('useMaterials must be used inside MaterialsContext');
  }

  return materials;
};
