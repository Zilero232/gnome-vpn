import { afterEach, describe, expect, it, vi } from 'vitest';

import { shareOrFallback } from '../share';

const data = { url: 'https://gnome-vpn.com/r/abc', text: 'Join' };

const stubShare = (share: ((data: ShareData) => Promise<void>) | undefined) => {
  Object.defineProperty(navigator, 'share', { value: share, configurable: true, writable: true });
};

describe('shareOrFallback', () => {
  afterEach(() => {
    stubShare(undefined);
  });

  it('falls back when the browser cannot share', async () => {
    const fallback = vi.fn(() => Promise.resolve());

    stubShare(undefined);
    await shareOrFallback({ data, fallback });

    expect(fallback).toHaveBeenCalledOnce();
  });

  it('shares through the native sheet and leaves the fallback alone', async () => {
    const share = vi.fn(() => Promise.resolve());
    const fallback = vi.fn(() => Promise.resolve());

    stubShare(share);
    await shareOrFallback({ data, fallback });

    expect(share).toHaveBeenCalledWith(data);
    expect(fallback).not.toHaveBeenCalled();
  });

  it('does nothing more when the reader closes the sheet', async () => {
    const fallback = vi.fn(() => Promise.resolve());

    stubShare(() => Promise.reject(new DOMException('closed', 'AbortError')));
    await shareOrFallback({ data, fallback });

    expect(fallback).not.toHaveBeenCalled();
  });

  it('falls back when sharing fails for any other reason', async () => {
    const fallback = vi.fn(() => Promise.resolve());

    stubShare(() => Promise.reject(new DOMException('denied', 'NotAllowedError')));
    await shareOrFallback({ data, fallback });

    expect(fallback).toHaveBeenCalledOnce();
  });
});
