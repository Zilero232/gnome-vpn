export const PRODUCTION_SSH = {
  defaultUser: 'root',
  defaultDeployPath: '/opt/gnomevpn',
  keyNames: ['gnomevpn_deploy', 'id_ed25519', 'id_rsa', 'id_ecdsa']
} as const;

export const ENV_NODES = {
  fileName: '.env.nodes',
  uploadSuffix: '.upload',
  mode: '600'
} as const;

export const HEREDOC_NONCE_BYTES = 8;

export const NODE_SYNC_SQL = {
  revokePeer: "revoked_at = now(), state = 'disabled'"
} as const;
