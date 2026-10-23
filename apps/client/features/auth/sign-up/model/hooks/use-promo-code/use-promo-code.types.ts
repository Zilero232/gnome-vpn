import type { UseFormRegister, UseFormSetFocus, UseFormSetValue } from 'react-hook-form';

import type { SignUpFormValues } from '../../../lib';

export type PromoState = 'closed' | 'opened' | 'prefilled';

export type UsePromoCodeInput = {
  register: UseFormRegister<SignUpFormValues>;
  setValue: UseFormSetValue<SignUpFormValues>;
  setFocus: UseFormSetFocus<SignUpFormValues>;
};
