import type { ReactNode } from 'react';

export type AuthPose = 'envelope' | 'key' | 'welcome';

export type AuthShellProps = {
  pose: AuthPose;
  aside?: ReactNode;
  isEntering?: boolean;
  children: ReactNode;
};
