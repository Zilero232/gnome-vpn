import { prop } from 'remeda';

import type { UpsertNodeArgs, UpsertNodeResult } from './upsert-node.types';

export const upsertNode = async ({ prisma, input }: UpsertNodeArgs): Promise<UpsertNodeResult> => {
  const { host, ...rest } = input;
  const existing = await prisma.node.findUnique({ where: { host }, select: { id: true } });

  // The host is what the row was found by, so an update leaves it alone — and
  // so does it leave `isAvailable`: an admin who took the node out of rotation
  // decided that, and re-provisioning must not quietly put it back.
  if (existing) {
    const updated = await prisma.node.update({
      where: { id: existing.id },
      data: rest
    });

    return { id: updated.id, wasExisting: true, replacedHosts: [] };
  }

  const replaced = await prisma.node.findMany({
    where: { countryCode: input.countryCode, host: { not: host } },
    select: { id: true, host: true }
  });

  if (replaced.length > 0) {
    await prisma.node.deleteMany({ where: { id: { in: replaced.map(prop('id')) } } });
  }

  const created = await prisma.node.create({
    data: { ...input, isAvailable: true }
  });

  return { id: created.id, wasExisting: false, replacedHosts: replaced.map(prop('host')) };
};
