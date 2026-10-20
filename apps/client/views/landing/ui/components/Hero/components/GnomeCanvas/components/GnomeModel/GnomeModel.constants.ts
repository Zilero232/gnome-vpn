export const BODY_PROFILE = [
  [0.001, 0.08],
  [0.56, 0.08],
  [0.62, 0.22],
  [0.58, 0.55],
  [0.47, 0.88],
  [0.33, 1.1],
  [0.001, 1.16]
] as const;

export const BEARD = {
  radius: 0.4,
  height: 0.9,
  depth: 0.5,
  lean: [0.2, 0.64],
  top: 1.44
} as const;

export const BREATH = {
  speed: 1.6,
  bob: 0.025,
  stretch: 0.012
} as const;
