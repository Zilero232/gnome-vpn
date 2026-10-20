'use client';

import type { UseAuthFormErrorInput } from './use-auth-form-error.types';

import { authErrorField } from '../../../lib';
import { errorMessageKey } from '../use-error-message/use-error-message.helpers';
import { useToastError } from '../use-toast-error';

export const useAuthFormError = ({ onFieldError }: UseAuthFormErrorInput) => {
  const toastError = useToastError();

  return (error: unknown) => {
    const message = errorMessageKey(error);
    const field = authErrorField(message);

    if (field) {
      onFieldError({ field, message });

      return;
    }

    toastError(error);
  };
};
