export const SYSCTL = {
  path: '/etc/sysctl.d/99-gnomevpn.conf',
  udpBufferBytes: 16_777_216,
  socketDefaultBytes: 4_194_304,
  tcpBufferBytes: 16_777_216,
  queueDiscipline: 'fq',
  congestionControl: 'bbr',
  conntrackMax: 262_144,
  swappiness: 10
} as const;

export const JOURNALD = {
  path: '/etc/systemd/journald.conf.d/gnomevpn.conf',
  maxUse: '300M'
} as const;

export const TIMESYNC = {
  path: '/etc/systemd/timesyncd.conf.d/gnomevpn.conf',
  servers: ['time.cloudflare.com', 'time.google.com'],
  fallback: ['ntp.ubuntu.com']
} as const;

export const APT_JOBS = {
  dropIn: 'gnomevpn.conf',
  units: [
    { name: 'apt-daily', time: '00:30', randomizedDelay: '30m' },
    { name: 'apt-daily-upgrade', time: '01:30', randomizedDelay: '30m' }
  ],
  nice: 19,
  cpuWeight: 10,
  ioWeight: 10
} as const;

export const IDLE_UNITS = [
  'ModemManager.service',
  'udisks2.service',
  'upower.service',
  'multipathd.service',
  'multipathd.socket',
  'fwupd.service',
  'fwupd-refresh.timer'
] as const;

export const DOCKER_DAEMON = {
  path: '/etc/docker/daemon.json',
  settings: {
    'live-restore': true
  }
} as const;
