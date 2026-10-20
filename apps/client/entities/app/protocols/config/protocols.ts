export const PROTOCOL_IDS = ['hysteria2', 'vless', 'wireguard'] as const;

export const PROTOCOL_ROWS = ['transport', 'port', 'lossBehaviour', 'blocking', 'bestFor'] as const;

export const SERVER_SECTIONS = ['whySeveral', 'whichToPick', 'howMany', 'addingMore'] as const;

export type ProtocolId = (typeof PROTOCOL_IDS)[number];

export const SERVER_LOCATIONS = [
  { code: 'nl', key: 'netherlands', lat: 52.37, lon: 4.9 },
  { code: 'fi', key: 'finland', lat: 60.17, lon: 24.94 }
] as const;
