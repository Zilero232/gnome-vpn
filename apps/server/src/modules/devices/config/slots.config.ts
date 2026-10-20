export const DEVICE_PEER = {
  namePrefix: 'd-',
  idLength: 12,
  ipsPerClient: 2,
  ipsPerKeylessClient: 1
} as const;

export const LEGACY_PEER = {
  name: 'incy',
  graceHours: 48
} as const;
