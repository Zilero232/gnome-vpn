import { isNonNullish, unique } from 'remeda';

import { DEVICE_TITLE } from '@/modules/devices/config';

import type { TitledDevice } from './device-title.types';

export const deviceTitle = ({ model, app, platform }: TitledDevice): string => {
  const parts = unique([model ?? platform, app].filter(isNonNullish));

  return parts.length > 0 ? parts.join(DEVICE_TITLE.separator) : DEVICE_TITLE.unknown;
};
