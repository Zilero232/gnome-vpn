export const WIREGUARD_CONF = {
  allowedIps: '0.0.0.0/0, ::/0',
  filePrefix: 'gnome',
  fileIdLength: 4,
  tunnelNameLength: 15,
  fileExtension: '.conf'
} as const;
