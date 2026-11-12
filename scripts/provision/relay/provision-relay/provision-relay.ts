import { all, dirOf, line, silent } from '@gnomevpn/scripts/shell';
import { SshClient } from '@gnomevpn/scripts/ssh';
import { isNonNullish } from 'remeda';

import type { RelayForward } from '../relay-rules';
import type { InstallForwardingInput, ProvisionRelayInput, RelayResult } from './provision-relay.types';

import { describeError } from '../../../../apps/server/src/common/lib/errors';
import { log } from '../../config';
import { routePorts } from '../../node';
import { connectNode, ensureFail2ban, ensureNftables, ensureUfw, lockToKey, tuneBase } from '../../remote';
import { RELAY, relayFirewallCommands, relayForwards, relayRuleset, relaySysctl, relayUnit } from '../relay-rules';

const describeForwards = (forwards: RelayForward[]): string =>
  forwards
    .map(({ tunnelPort, target, wireguardPort }) =>
      [
        `${tunnelPort} → ${target}:${RELAY.targetPort}`,
        ...[wireguardPort].filter(isNonNullish).map((wireguard) => `${wireguard} → ${target}:${RELAY.wireguardTargetPort}`)
      ].join(', ')
    )
    .join(', ');

const closeFirewall = async ({ ssh, forwards }: InstallForwardingInput): Promise<void> => {
  log.step('closing everything but ssh and the forwarded tunnels');

  await ssh.run(all(relayFirewallCommands(forwards)));

  log.done('the firewall is on');
};

const enableForwarding = async (ssh: SshClient): Promise<void> => {
  log.step(`turning on ip forwarding in ${RELAY.sysctlPath}`);

  await ssh.putFile({ content: relaySysctl(), remotePath: RELAY.sysctlPath });
  await ssh.run(silent('sysctl --system'));

  log.done('the kernel forwards packets');
};

const installForwards = async ({ ssh, forwards }: InstallForwardingInput): Promise<void> => {
  log.step(`writing ${forwards.length} forward(s) to ${RELAY.rulesetPath}`);

  await ssh.run(line(['mkdir', '-p', dirOf(RELAY.rulesetPath)]));
  await ssh.putFile({ content: relayRuleset(forwards), remotePath: RELAY.rulesetPath });
  await ssh.putFile({ content: relayUnit(), remotePath: RELAY.unitPath });

  await ssh.run(
    all([
      line([RELAY.nftBinary, '-c', '-f', RELAY.rulesetPath]),
      'systemctl daemon-reload',
      line(['systemctl', 'enable', RELAY.unitName]),
      line(['systemctl', 'restart', RELAY.unitName]),
      silent(line([RELAY.nftBinary, 'list', 'table', 'ip', RELAY.table]))
    ])
  );

  log.done(describeForwards(forwards));
};

export const provisionRelay = async ({ relay, nodes }: ProvisionRelayInput): Promise<RelayResult> => {
  const ssh = new SshClient();
  const outcome = { host: relay.host, ports: routePorts(relay.routes) };

  try {
    const forwards = relayForwards({ relay, nodes });

    await connectNode({ ssh, config: relay });
    await lockToKey({ ssh, config: relay });

    await ensureUfw(ssh);
    await ensureFail2ban(ssh);
    await ensureNftables(ssh);
    await closeFirewall({ ssh, forwards });
    await tuneBase(ssh);
    await enableForwarding(ssh);
    await installForwards({ ssh, forwards });

    return { ...outcome, status: 'provisioned' };
  } catch (error) {
    return { ...outcome, status: 'failed', error: describeError(error) };
  } finally {
    ssh.dispose();
  }
};
