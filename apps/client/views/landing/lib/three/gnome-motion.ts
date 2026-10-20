import type { GnomeAction, LimbInput, LimbPose, PhaseInput } from './three.types';

import { GNOME_ACTIONS } from './three.constants';

export const phase = ({ time, start, duration }: PhaseInput) => {
  const progress = (time - start) / duration;

  return progress >= 0 && progress <= 1 ? progress : null;
};

export const swell = (progress: number | null) => (progress === null ? 0 : Math.sin(Math.PI * progress));

export const hopHeight = (progress: number | null) => (progress === null ? 0 : 4 * progress * (1 - progress));

export const springKick = (progress: number | null) => (progress === null ? 0 : Math.exp(-3.2 * progress) * Math.sin(16 * progress));

export const nextAction = (current: GnomeAction) => GNOME_ACTIONS[(GNOME_ACTIONS.indexOf(current) + 1) % GNOME_ACTIONS.length];

export const limbPose = ({ from, to }: LimbInput): LimbPose => {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];

  return { length: Math.hypot(dx, dy), angle: Math.atan2(dx, -dy) };
};
