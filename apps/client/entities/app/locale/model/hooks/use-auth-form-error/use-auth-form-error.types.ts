import type { AuthErrorField } from '../../../lib';

export type AuthFieldErrorInput = {
  field: AuthErrorField;
  message: string;
};

export type UseAuthFormErrorInput = {
  onFieldError: (input: AuthFieldErrorInput) => void;
};
