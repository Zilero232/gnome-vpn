import type { AuthPose } from '../../AuthShell.types';

export type AuthSceneProps = {
  pose: AuthPose;
  isDoorOpen: boolean;
  isEntering: boolean;
  className?: string;
};
