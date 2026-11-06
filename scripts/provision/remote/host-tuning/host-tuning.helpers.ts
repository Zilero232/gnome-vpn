import type { AptJobUnit } from './host-tuning.types';

import { APT_JOBS, DOCKER_DAEMON, JOURNALD, SYSCTL, TIMESYNC } from './host-tuning.constants';

const confFile = (lines: string[]): string => [...lines, ''].join('\n');

const isJsonObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

export const sysctlConf = (): string =>
  confFile([
    `net.core.rmem_max = ${SYSCTL.udpBufferBytes}`,
    `net.core.wmem_max = ${SYSCTL.udpBufferBytes}`,
    `net.core.rmem_default = ${SYSCTL.socketDefaultBytes}`,
    `net.core.wmem_default = ${SYSCTL.socketDefaultBytes}`,
    `net.ipv4.tcp_rmem = 4096 131072 ${SYSCTL.tcpBufferBytes}`,
    `net.ipv4.tcp_wmem = 4096 16384 ${SYSCTL.tcpBufferBytes}`,
    `net.core.default_qdisc = ${SYSCTL.queueDiscipline}`,
    `net.ipv4.tcp_congestion_control = ${SYSCTL.congestionControl}`,
    'net.ipv4.tcp_mtu_probing = 1',
    'net.ipv4.tcp_slow_start_after_idle = 0',
    `net.netfilter.nf_conntrack_max = ${SYSCTL.conntrackMax}`,
    `vm.swappiness = ${SYSCTL.swappiness}`
  ]);

export const journaldConf = (): string => confFile(['[Journal]', `SystemMaxUse=${JOURNALD.maxUse}`]);

export const timesyncConf = (): string => {
  const servers = TIMESYNC.servers.join(' ');
  const fallback = TIMESYNC.fallback.join(' ');

  return confFile(['[Time]', `NTP=${servers}`, `FallbackNTP=${fallback}`]);
};

export const dailyAt = (time: string): string => `*-*-* ${time}`;

export const aptTimerConf = ({ time, randomizedDelay }: AptJobUnit): string =>
  confFile(['[Timer]', 'OnCalendar=', `OnCalendar=${dailyAt(time)}`, `RandomizedDelaySec=${randomizedDelay}`]);

export const aptServiceConf = (): string =>
  confFile(['[Service]', `Nice=${APT_JOBS.nice}`, `CPUWeight=${APT_JOBS.cpuWeight}`, `IOWeight=${APT_JOBS.ioWeight}`]);

export const dropInPath = (unit: string): string => `/etc/systemd/system/${unit}.d/${APT_JOBS.dropIn}`;

export const dockerDaemonConf = (current: string): string => {
  const parsed: unknown = current.trim() === '' ? {} : JSON.parse(current);

  if (!isJsonObject(parsed)) {
    throw new Error(`${DOCKER_DAEMON.path} is not a json object, refusing to rewrite it`);
  }

  const merged = { ...parsed, ...DOCKER_DAEMON.settings };

  return `${JSON.stringify(merged, null, 2)}\n`;
};
