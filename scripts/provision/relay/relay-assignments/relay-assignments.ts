import type { AssignRelaysInput, RelayAssignment } from './relay-assignments.types';

import { relayAssignments } from './relay-assignments.helpers';

export const assignRelays = async ({ prisma, nodes, relays, failedRelays }: AssignRelaysInput): Promise<RelayAssignment[]> => {
  const assignments = relayAssignments({ nodes, relays, failedRelays });

  for (const { host, relayHost, relayPort } of assignments) {
    await prisma.node.updateMany({ where: { host }, data: { relayHost, relayPort } });
  }

  return assignments;
};
