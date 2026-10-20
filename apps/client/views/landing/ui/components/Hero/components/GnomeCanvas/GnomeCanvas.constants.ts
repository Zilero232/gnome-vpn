export const GNOME_SCENE = {
  camera: { position: [0, 1.7, 8.6], fov: 34 },
  target: [0, 0.62, 0],
  scale: 0.78,
  lift: 0.24,
  dpr: { full: 1.75, lite: 1.25 },
  grass: { full: 46, lite: 18 },
  stars: { full: 70, lite: 30 },
  light: { hemisphere: 0.85, directional: 1.05 },
  restTurn: -0.2,
  pointerTurn: 0.22,
  pointerTilt: 0.05,
  scrollTurn: 0.5,
  damping: 3.5
} as const;

export const HAT = {
  radius: 0.47,
  height: 1.3,
  bend: 0.36,
  base: 1.78
} as const;

export const GNOME_RIG = {
  neck: 1.2,
  shoulders: { left: [-0.4, 0.98], right: [0.4, 0.98] },
  hands: { left: [-0.7, 0.62], right: [0.72, 0.62] },
  armDepth: 0.12,
  armReach: -0.36,
  headTurn: 0.55,
  headTilt: 0.22,
  eyeShift: 0.035,
  actionSeconds: 1.8,
  hopSeconds: 0.65,
  hopHeight: 0.42,
  actionGap: { min: 8, spread: 2 },
  wave: { lift: 2.1, wiggle: 0.35 },
  raise: { lift: 1.05 },
  flare: { action: 0.9, tap: 1.6 }
} as const;
