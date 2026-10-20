import type { RefObject } from 'react';
import type { Group } from 'three';

export type LanternProps = {
  armRef: RefObject<Group | null>;
};
