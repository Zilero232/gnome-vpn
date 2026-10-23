import type { z } from 'zod';

import type { routingSettingsSchema, updateRoutingSettingsSchema } from './routing.schemas';

export type RoutingSettings = z.infer<typeof routingSettingsSchema>;

export type UpdateRoutingSettingsInput = z.infer<typeof updateRoutingSettingsSchema>;
