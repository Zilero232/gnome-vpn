import type { GNOME_ACTIONS } from './three.constants';

export type ScatterInput = {
  count: number;
  innerRadius: number;
  outerRadius: number;
  seed: number;
};

export type ScatterPoint = {
  x: number;
  z: number;
  scale: number;
  turn: number;
};

export type SpherePoint = {
  x: number;
  y: number;
  z: number;
};

export type LatLonInput = {
  lat: number;
  lon: number;
  radius: number;
};

export type GnomeAction = (typeof GNOME_ACTIONS)[number];

export type PhaseInput = {
  time: number;
  start: number;
  duration: number;
};

export type LimbInput = {
  from: readonly [number, number];
  to: readonly [number, number];
};

export type LimbPose = {
  length: number;
  angle: number;
};

export type BeardWedgeInput = {
  radius: number;
  height: number;
  depth: number;
  lean: readonly [number, number];
};
