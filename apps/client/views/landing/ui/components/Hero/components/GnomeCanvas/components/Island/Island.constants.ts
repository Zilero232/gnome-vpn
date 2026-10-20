export const ISLAND = {
  radius: 2.05,
  depth: 1.9,
  drop: { y: -2.55, width: 3.2, depth: 1.6 },
  grass: { innerRadius: 0.75, outerRadius: 1.9, seed: 11 },
  mushrooms: [
    { position: [-1.25, 0, 0.75], scale: 1 },
    { position: [1.45, 0, -0.25], scale: 0.7 },
    { position: [-0.9, 0, -1.1], scale: 0.55 }
  ]
} as const;
