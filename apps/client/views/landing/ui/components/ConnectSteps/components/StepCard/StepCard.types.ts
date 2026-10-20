import type { IncyPlatform } from '@/entities/app/incy';

import type { CONNECT_STEPS } from '../../../../../config';

export type StepCardProps = {
  index: number;
  platform: IncyPlatform;
  step: (typeof CONNECT_STEPS)[number];
};
