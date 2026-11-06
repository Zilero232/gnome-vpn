import { describe, expect, it } from 'vitest';

import { PORTS } from '../../../config';
import { FIREWALL } from '../firewall.constants';
import { firewallCommands, validSources } from '../firewall.helpers';

const PRODUCTION = '81.19.136.20';
const WORKSTATION = '77.220.52.146';

describe('firewallCommands', () => {
  it('lets ssh in before it turns the firewall on, so the run never locks itself out', () => {
    const commands = firewallCommands([PRODUCTION]);

    expect(commands.findIndex((command) => command.includes(`${FIREWALL.sshPort}/tcp`))).toBeLessThan(commands.indexOf('ufw --force enable'));
  });

  it('denies by default and opens every tunnel port', () => {
    const commands = firewallCommands([PRODUCTION]);

    expect(commands).toContain('ufw default deny incoming');

    for (const rule of FIREWALL.tunnelRules) {
      expect(commands).toContain(`ufw allow ${rule}`);
    }
  });

  it('opens the panel only to the addresses it is given', () => {
    const panel = firewallCommands([PRODUCTION, WORKSTATION]).filter((command) => command.includes(`port ${PORTS.panel}`));

    expect(panel).toHaveLength(2);
    expect(panel.join(' ')).toContain(PRODUCTION);
    expect(panel.join(' ')).toContain(WORKSTATION);
  });

  it('keeps the panel reachable when it knows no address to limit it to', () => {
    expect(firewallCommands([])).toContain(`ufw allow ${PORTS.panel}/tcp`);
  });

  it('starts from a clean rule set, so an address from an older run does not linger', () => {
    expect(firewallCommands([PRODUCTION])[0]).toBe('ufw --force reset');
  });
});

describe('validSources', () => {
  it('drops blanks, duplicates and anything that is not an ip address', () => {
    expect(validSources([PRODUCTION, ` ${PRODUCTION}\n`, '', 'not-an-ip; rm -rf /'])).toEqual([PRODUCTION]);
  });
});
