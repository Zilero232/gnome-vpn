export const DOCKER = {
  installUrl: 'https://get.docker.com',
  probe: 'docker --version'
} as const;

export const APT = {
  env: 'DEBIAN_FRONTEND=noninteractive',
  lockTimeout: '-o DPkg::Lock::Timeout=300'
} as const;

export const FAIL2BAN = {
  jailPath: '/etc/fail2ban/jail.d/sshd.local',
  maxRetry: 5,
  findTimeSeconds: 600,
  banTimeSeconds: 3600
} as const;
