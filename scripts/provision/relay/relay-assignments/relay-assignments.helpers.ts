import { isNonNullish } from 'remeda';

import type { RelayAssignment, RelayAssignmentsInput } from './relay-assignments.types';

export const relayAssignments = ({ nodes, relays, failedRelays }: RelayAssignmentsInput): RelayAssignment[] => {
  const routes = relays.flatMap((relay) => relay.routes.map((route) => ({ relayHost: relay.host, ...route })));

  return nodes
    .map(({ host, countryCode }) => {
      const route = routes.find((candidate) => candidate.countryCode === countryCode);

      if (!route) {
        return { host, relayHost: null, relayPort: null };
      }

      return failedRelays.includes(route.relayHost) ? null : { host, relayHost: route.relayHost, relayPort: route.port };
    })
    .filter(isNonNullish);
};
