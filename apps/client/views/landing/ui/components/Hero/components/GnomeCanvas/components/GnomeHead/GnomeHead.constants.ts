export const HEAD = {
  radius: 0.42,
  centre: 0.24,
  eyes: { x: 0.15, y: 0.39, z: 0.36, radius: 0.058 },
  cheeks: { x: 0.25, y: 0.27, z: 0.33, radius: 0.085 },
  nose: { y: 0.25, z: 0.43, radius: 0.12 }
} as const;

export const BLINK = {
  period: 4.6,
  offset: 2.3,
  length: 0.14
} as const;
