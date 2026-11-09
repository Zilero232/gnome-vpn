import { z } from 'zod';

import { duplicatesOf } from './nodes-config.helpers';

const countryCodeSchema = z.string().regex(/^[A-Z]{2}$/, 'must be two uppercase letters');

const sshTargetShape = {
  host: z.string().min(1),
  sshUser: z.string().min(1),
  sshPassword: z.string().min(1).optional()
};

export const nodeConfigSchema = z.object({
  ...sshTargetShape,
  country: z.string().min(1),
  countryCode: countryCodeSchema,
  city: z.string().min(1).optional()
});

export const relayRouteSchema = z.object({
  countryCode: countryCodeSchema,
  port: z.number().int().min(1024, 'must be 1024 or above, clear of ssh and the well-known ports').max(65_535)
});

export const relayConfigSchema = z.object({
  ...sshTargetShape,
  routes: z.array(relayRouteSchema).min(1)
});

const nodeListSchema = z.array(nodeConfigSchema).superRefine((nodes, context) => {
  for (const field of ['host', 'countryCode'] as const) {
    for (const value of duplicatesOf(nodes.map((node) => node[field]))) {
      context.addIssue({ code: 'custom', path: [field], message: `${value} appears more than once` });
    }
  }
});

const provisionConfigSchema = z
  .object({
    nodes: nodeListSchema,
    relays: z.array(relayConfigSchema).default([])
  })
  .superRefine(({ nodes, relays }, context) => {
    const nodeHosts = new Set(nodes.map((node) => node.host));
    const countryCodes = new Set(nodes.map((node) => node.countryCode));

    for (const value of duplicatesOf(relays.map((relay) => relay.host))) {
      context.addIssue({ code: 'custom', path: ['relays', 'host'], message: `${value} appears more than once` });
    }

    for (const value of duplicatesOf(relays.flatMap((relay) => relay.routes.map((route) => route.countryCode)))) {
      context.addIssue({ code: 'custom', path: ['relays', 'routes'], message: `${value} is routed by more than one relay` });
    }

    relays.forEach((relay, index) => {
      if (nodeHosts.has(relay.host)) {
        context.addIssue({ code: 'custom', path: ['relays', index, 'host'], message: `${relay.host} is a node, not a relay` });
      }

      for (const value of duplicatesOf(relay.routes.map((route) => String(route.port)))) {
        context.addIssue({ code: 'custom', path: ['relays', index, 'routes'], message: `port ${value} is used twice` });
      }

      for (const route of relay.routes.filter((candidate) => !countryCodes.has(candidate.countryCode))) {
        context.addIssue({ code: 'custom', path: ['relays', index, 'routes'], message: `${route.countryCode} is not a node in this file` });
      }
    });
  });

export const nodesConfigSchema = z.preprocess((raw) => (Array.isArray(raw) ? { nodes: raw } : raw), provisionConfigSchema);
