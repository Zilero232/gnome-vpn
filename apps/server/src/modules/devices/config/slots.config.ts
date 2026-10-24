export const DEVICE_PEER = {
  namePrefix: 'd-',
  idLength: 12,
  ipsPerClient: 2,
  ipsPerKeylessClient: 1
} as const;

export const DEVICE_ORDER = [{ createdAt: 'asc' }, { id: 'asc' }] as const;
