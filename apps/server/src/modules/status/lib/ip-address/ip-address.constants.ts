export const IP_FAMILY = {
  none: 0,
  v6: 6
} as const;

export const IPV4_MAPPED = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/u;
