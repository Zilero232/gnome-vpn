import type { ReactNode } from 'react';
import type { Control } from 'react-hook-form';

import type { SignUpFormValues } from '../../../lib';

export type ConsentCheckboxProps = {
  control: Control<SignUpFormValues>;
  name: 'isConsentGiven' | 'isMarketingConsentGiven';
  children: ReactNode;
  error?: string;
};
