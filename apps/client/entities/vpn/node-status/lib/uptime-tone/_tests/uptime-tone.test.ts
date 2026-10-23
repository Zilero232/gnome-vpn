import { describe, expect, it } from 'vitest';

import { UPTIME_BANDS, UPTIME_TONE } from '../../../config';
import { uptimeTone } from '../uptime-tone';

describe('uptimeTone', () => {
  it('marks a day nothing checked as having no data, not as an outage', () => {
    expect(uptimeTone(null)).toBe(UPTIME_TONE.none);
  });

  it('opens each band at its own threshold', () => {
    expect(uptimeTone(UPTIME_BANDS.good)).toBe(UPTIME_TONE.good);
    expect(uptimeTone(UPTIME_BANDS.fair)).toBe(UPTIME_TONE.fair);
  });

  it('drops just below a threshold into the band under it', () => {
    expect(uptimeTone(UPTIME_BANDS.good - 0.001)).toBe(UPTIME_TONE.fair);
    expect(uptimeTone(UPTIME_BANDS.fair - 0.001)).toBe(UPTIME_TONE.poor);
  });

  it('calls a full day good and a dead one poor', () => {
    expect(uptimeTone(1)).toBe(UPTIME_TONE.good);
    expect(uptimeTone(0)).toBe(UPTIME_TONE.poor);
  });
});
