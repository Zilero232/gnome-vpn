import type { Ref } from 'react';
import type { Group } from 'three';

export type ArmProps = {
  ref: Ref<Group>;
  side: 'left' | 'right';
};
