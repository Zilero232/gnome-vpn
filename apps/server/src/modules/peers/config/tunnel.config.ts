export const TUNNEL = {
  insecure: false,
  dns: ['1.1.1.1', '8.8.8.8']
} as const;

export const REALITY = {
  listenPort: 443,
  fingerprint: 'chrome',
  flow: '',
  serviceName: 'grpc',
  shortIdBytes: 8
} as const;

export const WIREGUARD = {
  listenPort: 51820,
  mtu: 1360
} as const;
