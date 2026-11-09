import type { SshClient } from '@gnomevpn/scripts/ssh';

import { all, dirOf, line, orElse, quiet, silent } from '@gnomevpn/scripts/shell';

import type { PutConfInput, ReadRemoteFileInput } from './host-tuning.types';

import { log } from '../../config';
import { APT_JOBS, DOCKER_DAEMON, IDLE_UNITS, JOURNALD, SYSCTL, TIMESYNC } from './host-tuning.constants';
import { aptServiceConf, aptTimerConf, dockerDaemonConf, dropInPath, journaldConf, sysctlConf, timesyncConf } from './host-tuning.helpers';

const putConf = async ({ ssh, path, content }: PutConfInput): Promise<void> => {
  await ssh.run(line(['mkdir', '-p', dirOf(path)]));
  await ssh.putFile({ content, remotePath: path });
};

const readRemoteFile = async ({ ssh, path }: ReadRemoteFileInput): Promise<string> => {
  const result = await ssh.exec(quiet(line(['cat', path])));

  return result.exitCode === 0 ? result.stdout : '';
};

const tuneNetwork = async (ssh: SshClient): Promise<void> => {
  log.step(`writing the network tuning to ${SYSCTL.path}`);

  const loadCongestionControl = line(['modprobe', `tcp_${SYSCTL.congestionControl}`]);

  await ssh.putFile({ content: sysctlConf(), remotePath: SYSCTL.path });
  await ssh.run(all([loadCongestionControl, silent('sysctl --system')]));

  log.done(`udp buffers raised to ${SYSCTL.udpBufferBytes} bytes, tcp on ${SYSCTL.congestionControl}`);
};

const capJournal = async (ssh: SshClient): Promise<void> => {
  log.step(`capping the journal at ${JOURNALD.maxUse}`);

  const vacuum = silent(line(['journalctl', `--vacuum-size=${JOURNALD.maxUse}`]));

  await putConf({ ssh, path: JOURNALD.path, content: journaldConf() });
  await ssh.run(all(['systemctl restart systemd-journald', vacuum]));

  log.done(`the journal keeps at most ${JOURNALD.maxUse}`);
};

const syncClock = async (ssh: SshClient): Promise<void> => {
  log.step(`pointing the clock at ${TIMESYNC.servers.join(', ')}`);

  await putConf({ ssh, path: TIMESYNC.path, content: timesyncConf() });
  await ssh.run('systemctl restart systemd-timesyncd');

  log.done('ntp no longer depends on ntp.ubuntu.com alone');
};

const quietUpdates = async (ssh: SshClient): Promise<void> => {
  log.step('moving the package updates to the night, at the lowest priority');

  for (const unit of APT_JOBS.units) {
    await putConf({ ssh, path: dropInPath(`${unit.name}.timer`), content: aptTimerConf(unit) });
    await putConf({ ssh, path: dropInPath(`${unit.name}.service`), content: aptServiceConf() });
  }

  const timers = APT_JOBS.units.map((unit) => `${unit.name}.timer`);

  await ssh.run(all(['systemctl daemon-reload', line(['systemctl', 'restart', ...timers])]));

  log.done(APT_JOBS.units.map((unit) => `${unit.name} at ${unit.time} utc`).join(', '));
};

const stopIdleUnits = async (ssh: SshClient): Promise<void> => {
  log.step(`stopping what a vps never uses: ${IDLE_UNITS.join(', ')}`);

  const mask = silent(line(['systemctl', 'mask', '--now', ...IDLE_UNITS]));

  await ssh.run(orElse([mask, 'true']));

  log.done('idle units masked');
};

const keepContainersOnDockerRestart = async (ssh: SshClient): Promise<void> => {
  log.step(`turning on live-restore in ${DOCKER_DAEMON.path}`);

  const current = await readRemoteFile({ ssh, path: DOCKER_DAEMON.path });

  await putConf({ ssh, path: DOCKER_DAEMON.path, content: dockerDaemonConf(current) });
  await ssh.run('systemctl reload docker');

  log.done('a docker restart no longer takes the tunnel down with it');
};

export const tuneBase = async (ssh: SshClient): Promise<void> => {
  await tuneNetwork(ssh);
  await capJournal(ssh);
  await syncClock(ssh);
  await quietUpdates(ssh);
  await stopIdleUnits(ssh);
};

export const tuneHost = async (ssh: SshClient): Promise<void> => {
  await tuneBase(ssh);
  await keepContainersOnDockerRestart(ssh);
};
