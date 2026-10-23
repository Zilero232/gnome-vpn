'use client';

import { useDocumentEvent } from '@siberiacancode/reactuse';
import { toast, Toaster } from 'sonner';

import { ACTION_SELECTOR, TOAST_GAP, TOAST_OFFSET, TOAST_OPTIONS, TOAST_SELECTOR } from './AppToaster.constants';

export const AppToaster = () => {
  useDocumentEvent('click', ({ target }) => {
    if (!(target instanceof Element) || !target.closest(TOAST_SELECTOR) || target.closest(ACTION_SELECTOR)) {
      return;
    }

    toast.dismiss();
  });

  return (
    <Toaster
      className='gnomevpn-toaster'
      gap={TOAST_GAP}
      mobileOffset={TOAST_OFFSET.mobile}
      offset={TOAST_OFFSET.desktop}
      position='bottom-right'
      theme='light'
      toastOptions={TOAST_OPTIONS}
    />
  );
};
