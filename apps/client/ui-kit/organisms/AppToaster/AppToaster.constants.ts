export const TOAST_SELECTOR = '[data-sonner-toast]';

export const ACTION_SELECTOR = 'button, a, [role="button"]';

export const TOAST_GAP = 8;

export const TOAST_OPTIONS = {
  style: {
    fontFamily: 'var(--font-sans)'
  }
};

export const TOAST_OFFSET = {
  desktop: { bottom: 'calc(var(--safe-area-bottom) + 24px)', right: 24 },
  mobile: { bottom: 'calc(var(--safe-area-bottom) + 12px)', left: 12, right: 12 }
} as const;

export const CELEBRATE_CLASS = 'gnomevpn-celebrate';
