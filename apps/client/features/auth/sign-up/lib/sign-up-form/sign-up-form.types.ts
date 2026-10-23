import type { z } from 'zod';

import type { signUpFormSchema } from './sign-up-form.schemas';

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;
