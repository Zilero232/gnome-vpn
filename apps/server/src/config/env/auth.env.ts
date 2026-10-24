import { z } from 'zod';

import { emailList } from './env.helpers';

export const authEnv = z
  .object({
    BETTER_AUTH_SECRET: z.string().min(1),
    ADMIN_EMAILS: z.string().default('').transform(emailList).pipe(z.array(z.email()))
  })
  .transform((raw) => ({
    secret: raw.BETTER_AUTH_SECRET,
    adminEmails: raw.ADMIN_EMAILS
  }));
