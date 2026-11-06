import type { z } from 'zod';

import type { adminNodeAvailabilitySchema, adminNodeListSchema, adminNodeOnlineSchema, adminNodePeakSchema, adminNodeSchema } from './nodes.schemas';

export type AdminNode = z.infer<typeof adminNodeSchema>;

export type AdminNodeOnline = z.infer<typeof adminNodeOnlineSchema>;

export type AdminNodePeak = z.infer<typeof adminNodePeakSchema>;

export type AdminNodeList = z.infer<typeof adminNodeListSchema>;

export type AdminNodeAvailability = z.infer<typeof adminNodeAvailabilitySchema>;
