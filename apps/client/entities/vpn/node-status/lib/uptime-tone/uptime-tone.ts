import { isNullish } from 'remeda';

import type { UptimeTone } from '../../config';

import { UPTIME_BANDS, UPTIME_TONE } from '../../config';

export const uptimeTone = (uptime: number | null): UptimeTone => {
  if (isNullish(uptime)) {
    return UPTIME_TONE.none;
  }

  if (uptime >= UPTIME_BANDS.good) {
    return UPTIME_TONE.good;
  }

  return uptime >= UPTIME_BANDS.fair ? UPTIME_TONE.fair : UPTIME_TONE.poor;
};
