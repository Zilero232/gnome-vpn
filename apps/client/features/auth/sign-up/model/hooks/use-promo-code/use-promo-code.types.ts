import type { SignUpValues } from '@gnomevpn/schemas';
import type { UseFormRegister, UseFormSetFocus, UseFormSetValue } from 'react-hook-form';

export type PromoState = 'closed' | 'opened' | 'prefilled';

export type UsePromoCodeInput = {
  register: UseFormRegister<SignUpValues>;
  setValue: UseFormSetValue<SignUpValues>;
  setFocus: UseFormSetFocus<SignUpValues>;
};
