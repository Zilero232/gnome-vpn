const INBOUNDS = '/panel/api/inbounds';
const SERVER = '/panel/api/server';
const CLIENTS = '/panel/api/clients';

const NO_LIMIT = 0;

export const PANEL = {
  username: 'gnomevpn',
  requestTimeoutMs: 10_000,
  runningState: 'running',
  routes: {
    listInbounds: `${INBOUNDS}/list`,
    addInbound: `${INBOUNDS}/add`,
    updateInbound: (id: number) => `${INBOUNDS}/update/${id}`,
    restartCore: `${SERVER}/restartXrayService`,
    serverStatus: `${SERVER}/status`,
    onlines: `${CLIENTS}/onlines`,
    lastOnline: `${CLIENTS}/lastOnline`,
    addClient: `${CLIENTS}/add`,
    deleteClient: (email: string) => `${CLIENTS}/del/${encodeURIComponent(email)}`,
    setEnabled: (enabled: boolean) => `${CLIENTS}/${enabled ? 'bulkEnable' : 'bulkDisable'}`
  }
} as const;

export const INBOUND = {
  hysteria: { remark: 'GnomeVPN Hysteria2' },
  vless: { remark: 'GnomeVPN Reality', flow: '' },
  wireguard: { remark: 'GnomeVPN WireGuard', keepAlive: 25, hostMask: '/32' }
} as const;

export const CLIENT_DEFAULTS = {
  enable: true,
  totalGB: NO_LIMIT,
  expiryTime: NO_LIMIT,
  tgId: NO_LIMIT,
  reset: NO_LIMIT
} as const;

export const AUTH_BYTES = 24;

export const NO_TRAFFIC = { up: 0, down: 0 } as const;
