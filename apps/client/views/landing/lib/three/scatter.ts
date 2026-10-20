import type { LatLonInput, ScatterInput, ScatterPoint, SpherePoint } from './three.types';

const MODULUS = 2_147_483_647;
const MULTIPLIER = 48_271;

const random = (seed: number) => {
  let state = seed % MODULUS;

  return () => {
    state = (state * MULTIPLIER) % MODULUS;

    return state / MODULUS;
  };
};

export const scatterOnDisc = ({ count, innerRadius, outerRadius, seed }: ScatterInput): ScatterPoint[] => {
  const next = random(seed);

  return Array.from({ length: count }, () => {
    const angle = next() * Math.PI * 2;
    const radius = innerRadius + Math.sqrt(next()) * (outerRadius - innerRadius);

    return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, scale: 0.6 + next() * 0.8, turn: next() * Math.PI };
  });
};

export const fibonacciSphere = (count: number): SpherePoint[] =>
  Array.from({ length: count }, (_, index) => {
    const y = 1 - ((index + 0.5) / count) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = Math.PI * (3 - Math.sqrt(5)) * index;

    return { x: Math.cos(theta) * ring, y, z: Math.sin(theta) * ring };
  });

export const latLonToPoint = ({ lat, lon, radius }: LatLonInput): SpherePoint => {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;

  return { x: -radius * Math.sin(phi) * Math.cos(theta), y: radius * Math.cos(phi), z: radius * Math.sin(phi) * Math.sin(theta) };
};
