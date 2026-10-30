export const SYSCTL = {
  path: '/etc/sysctl.d/99-gnomevpn.conf',
  udpBufferBytes: 16_777_216,
  queueDiscipline: 'fq',
  congestionControl: 'bbr'
} as const;

export const JOURNALD = {
  path: '/etc/systemd/journald.conf.d/gnomevpn.conf',
  maxUse: '300M'
} as const;
