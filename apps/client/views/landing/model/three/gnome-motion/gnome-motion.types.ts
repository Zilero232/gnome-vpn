import type { GnomeAction } from '../../../lib/three';

export type GnomeMotion = {
  pointer: { x: number; y: number };
  isTapPending: boolean;
  hopStart: number;
  action: GnomeAction;
  actionStart: number;
  nextActionAt: number;
};
