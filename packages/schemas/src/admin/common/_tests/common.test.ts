import { describe, expect, it } from 'vitest';

import { ADMIN_ID } from '../common.constants';
import { adminDeviceParamSchema, adminIdParamSchema } from '../common.schemas';

const deviceId = crypto.randomUUID();

describe('adminIdParamSchema', () => {
  it('takes the id better-auth gives a user as well as a database uuid', () => {
    for (const id of ['dsZGjcbWa0MX2hkqdH6jkSsUFFq5OLfz', crypto.randomUUID()]) {
      expect(adminIdParamSchema.safeParse({ id }).success).toBe(true);
      expect(adminDeviceParamSchema.safeParse({ id, deviceId }).success).toBe(true);
    }
  });

  it('refuses an empty id and one longer than any the database issues', () => {
    for (const id of ['', 'x'.repeat(ADMIN_ID.maxLength + 1)]) {
      expect(adminIdParamSchema.safeParse({ id }).success).toBe(false);
    }
  });
});
