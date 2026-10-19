import { describe, expect, it } from 'vitest';

import { INCY_DESKTOP_RELEASE } from '../clients.constants';
import { INCY_DOWNLOADS } from '../clients.registry';

const DESKTOP = [INCY_DOWNLOADS.windows, INCY_DOWNLOADS.macos, INCY_DOWNLOADS.linux];

describe('INCY_DOWNLOADS', () => {
  it('pins the desktop files to a desktop release, since latest can be an Android-only one', () => {
    for (const url of DESKTOP) {
      expect(url).not.toContain('/latest/');
      expect(url).toContain(`/releases/download/${INCY_DESKTOP_RELEASE}/`);
    }
  });

  it('names a desktop tag', () => {
    expect(INCY_DESKTOP_RELEASE).toMatch(/^desktop-v\d+\.\d+\.\d+$/u);
  });

  it('serves every link over https', () => {
    for (const url of Object.values(INCY_DOWNLOADS)) {
      expect(new URL(url).protocol).toBe('https:');
    }
  });
});
