import type { UseFormRegisterReturn } from 'react-hook-form';

export type PromoCodeFieldProps = {
  isOpen: boolean;
  registration: UseFormRegisterReturn<'promoCode'>;
  error?: string;
  onOpen: () => void;
};
