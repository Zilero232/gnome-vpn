export const LANTERN = {
  bars: [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2],
  barRadius: 0.088,
  glass: { radius: 0.072, height: 0.17, y: -0.2 },
  light: { base: 0.22, flicker: 0.05, distance: 1.2, decay: 2 }
} as const;
