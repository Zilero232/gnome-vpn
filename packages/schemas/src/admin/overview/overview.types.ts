import type { z } from 'zod';

import type { adminNodeTallySchema, adminOverviewSchema, adminShareSchema } from './overview.schemas';

export type AdminShare = z.infer<typeof adminShareSchema>;

export type AdminNodeTally = z.infer<typeof adminNodeTallySchema>;

export type AdminOverview = z.infer<typeof adminOverviewSchema>;
