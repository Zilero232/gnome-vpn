import type { SshClient } from '@gnomevpn/scripts/ssh';

import { all, dirOf, line, silent } from '@gnomevpn/scripts/shell';

import { log } from '../../config';
import { JOURNALD, SYSCTL } from './host-tuning.constants';
import { journaldConf, sysctlConf } from './host-tuning.helpers';

export const tuneHost = async (ssh: SshClient) => {
  log.step(`writing the network tuning to ${SYSCTL.path}`);

  await ssh.putFile({ content: sysctlConf(), remotePath: SYSCTL.path });
  await ssh.run(all([line(['modprobe', `tcp_${SYSCTL.congestionControl}`]), silent('sysctl --system')]));

  log.done(`udp buffers raised to ${SYSCTL.udpBufferBytes} bytes, tcp on ${SYSCTL.congestionControl}`);
  log.step(`capping the journal at ${JOURNALD.maxUse}`);

  await ssh.run(line(['mkdir', '-p', dirOf(JOURNALD.path)]));
  await ssh.putFile({ content: journaldConf(), remotePath: JOURNALD.path });
  await ssh.run(all(['systemctl restart systemd-journald', silent(line(['journalctl', `--vacuum-size=${JOURNALD.maxUse}`]))]));

  log.done(`the journal keeps at most ${JOURNALD.maxUse}`);
};
