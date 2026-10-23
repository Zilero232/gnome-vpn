import type { ShareOrFallbackInput } from './share.types';

import { isBrowser } from '../env';

export const canShare = (): boolean => isBrowser() && typeof navigator.share === 'function';

export const shareOrFallback = async ({ data, fallback }: ShareOrFallbackInput): Promise<void> => {
  if (!canShare()) {
    await fallback();

    return;
  }

  try {
    await navigator.share(data);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return;
    }

    await fallback();
  }
};
