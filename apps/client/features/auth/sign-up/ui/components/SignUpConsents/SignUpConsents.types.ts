import type { Control } from 'react-hook-form';

import type { SignUpFormValues } from '../../../lib';

export type SignUpConsentsProps = {
  control: Control<SignUpFormValues>;
  error?: string;
};
