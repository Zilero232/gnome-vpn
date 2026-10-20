import { subHours } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { claimBlockedNotice } from '../blocked-notice';
import { BLOCKED_NOTICE } from '../blocked-notice.constants';

const NOW = new Date('2026-10-20T12:00:00.000Z');
const windowStart = subHours(NOW, 24);

describe('claimBlockedNotice', () => {
  it('claims the first notice of a window', () => {
    expect(claimBlockedNotice({ stored: null, noticeAt: null, key: 'hwid:A', windowStart })).toBe('hwid:A');
  });

  it('stays quiet about a device already named inside the window', () => {
    expect(claimBlockedNotice({ stored: 'hwid:A|hwid:B', noticeAt: subHours(NOW, 1), key: 'hwid:A', windowStart })).toBeNull();
  });

  it('names a second device once, so two blocked devices taking turns do not repeat the notice', () => {
    const afterA = claimBlockedNotice({ stored: 'hwid:A', noticeAt: subHours(NOW, 1), key: 'hwid:B', windowStart });

    expect(afterA).toBe('hwid:A|hwid:B');
    expect(claimBlockedNotice({ stored: afterA, noticeAt: subHours(NOW, 1), key: 'hwid:A', windowStart })).toBeNull();
  });

  it('starts over once the window has passed', () => {
    expect(claimBlockedNotice({ stored: 'hwid:A', noticeAt: subHours(NOW, 25), key: 'hwid:A', windowStart })).toBe('hwid:A');
  });

  it('stops naming new devices once the window holds as many as it keeps', () => {
    const full = Array.from({ length: BLOCKED_NOTICE.maxKeys }, (_, index) => `hwid:${index}`).join(BLOCKED_NOTICE.separator);

    expect(claimBlockedNotice({ stored: full, noticeAt: subHours(NOW, 1), key: 'hwid:new', windowStart })).toBeNull();
  });
});
