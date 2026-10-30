import { addMinutes, addSeconds } from 'date-fns';
import { describe, expect, it } from 'vitest';

import type { NodeLifetime } from '../node-restart.types';

import { nodeRestart } from '../node-restart';

const BOOTED_AT = new Date('2026-10-19T22:57:19Z');
const CORE_STARTED_AT = new Date('2026-10-19T22:57:36Z');

const LIFETIME: NodeLifetime = { bootedAt: BOOTED_AT, coreStartedAt: CORE_STARTED_AT };

describe('nodeRestart', () => {
  it('sees nothing while the host and the core keep the same start', () => {
    expect(nodeRestart({ previous: LIFETIME, current: LIFETIME })).toBeNull();
  });

  it('forgives the drift of a probe that answered a few seconds late', () => {
    const current = { bootedAt: addSeconds(BOOTED_AT, 4), coreStartedAt: addSeconds(CORE_STARTED_AT, 4) };

    expect(nodeRestart({ previous: LIFETIME, current })).toBeNull();
  });

  it('reports a core that started again on a host that did not reboot', () => {
    expect(nodeRestart({ previous: LIFETIME, current: { ...LIFETIME, coreStartedAt: addMinutes(CORE_STARTED_AT, 90) } })).toBe('core');
  });

  it('reports a reboot rather than the core restart that came with it', () => {
    const current = { bootedAt: addMinutes(BOOTED_AT, 90), coreStartedAt: addMinutes(CORE_STARTED_AT, 90) };

    expect(nodeRestart({ previous: LIFETIME, current })).toBe('reboot');
  });

  it('has nothing to compare against on the first probe of a node', () => {
    expect(nodeRestart({ previous: { bootedAt: null, coreStartedAt: null }, current: LIFETIME })).toBeNull();
  });

  it('has nothing to compare against when the panel stops reporting an uptime', () => {
    expect(nodeRestart({ previous: LIFETIME, current: { bootedAt: null, coreStartedAt: null } })).toBeNull();
  });
});
