export const SSHD = {
  dropInPath: '/etc/ssh/sshd_config.d/00-gnomevpn.conf',
  settings: {
    PermitRootLogin: 'prohibit-password',
    PasswordAuthentication: 'no',
    KbdInteractiveAuthentication: 'no'
  }
} as const;
