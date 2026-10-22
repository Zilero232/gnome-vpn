export const WIREGUARD_APPS = [
  { id: 'wiresock', links: [{ store: 'site', href: 'https://wiresock.net/wiresock-secure-connect/download' }] },
  {
    id: 'amnezia',
    links: [
      { store: 'android', href: 'https://play.google.com/store/apps/details?id=org.amnezia.vpn' },
      { store: 'ios', href: 'https://apps.apple.com/app/amneziavpn/id1600529900' }
    ]
  },
  { id: 'wireguard', links: [{ store: 'site', href: 'https://www.wireguard.com/install/' }] }
] as const;
