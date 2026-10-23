const SLUGS = [
  'vpn-iphone-ipad',
  'vpn-android',
  'vpn-windows-macos',
  'vpn-android-tv',
  'wireguard-router-config',
  'vpn-not-connecting',
  'vpn-not-working-hotel-wifi',
  'why-vpn-slows-down',
  'hysteria2-vs-vless',
  'subscription-link-explained'
] as const;

export type BlogSlug = (typeof SLUGS)[number];

export const BLOG_SLUGS: readonly BlogSlug[] = SLUGS;

export const POST_SECTIONS: Record<BlogSlug, readonly string[]> = {
  'vpn-iphone-ipad': ['whatYouNeed', 'addingLink', 'firstConnection', 'routingAndAds', 'otherDevices'],
  'vpn-android': ['installing', 'addingLink', 'firstConnection', 'stayingConnected', 'tvAndTablets'],
  'vpn-windows-macos': ['download', 'installing', 'addingLink', 'officeNetworks', 'alternatives'],
  'vpn-android-tv': ['whatYouNeed', 'installing', 'addingSubscription', 'remoteControl', 'autoConnect'],
  'wireguard-router-config': ['whenToUse', 'gettingConfig', 'router', 'apps', 'limits'],
  'vpn-not-connecting': ['accessAndRefresh', 'protocolOrCountry', 'statusPage', 'devicesAndLink', 'support'],
  'vpn-not-working-hotel-wifi': ['whyItFails', 'udpBlocked', 'switchToTcp', 'captivePortal', 'stillStuck'],
  'why-vpn-slows-down': ['distance', 'protocol', 'packetLoss', 'provider', 'whatToDo'],
  'hysteria2-vs-vless': ['whatIsHysteria', 'whatIsReality', 'packetLoss', 'blocking', 'howToChoose'],
  'subscription-link-explained': ['whatItIs', 'whyOneLink', 'howItUpdates', 'security', 'otherApps']
};

export const POST_RELATED: Record<BlogSlug, readonly BlogSlug[]> = {
  'vpn-iphone-ipad': ['vpn-not-connecting', 'subscription-link-explained', 'hysteria2-vs-vless'],
  'vpn-android': ['vpn-android-tv', 'vpn-not-connecting', 'subscription-link-explained'],
  'vpn-windows-macos': ['vpn-not-connecting', 'wireguard-router-config', 'vpn-not-working-hotel-wifi'],
  'vpn-android-tv': ['vpn-android', 'vpn-iphone-ipad', 'vpn-not-connecting'],
  'wireguard-router-config': ['vpn-not-connecting', 'hysteria2-vs-vless', 'vpn-windows-macos'],
  'vpn-not-connecting': ['vpn-not-working-hotel-wifi', 'hysteria2-vs-vless', 'why-vpn-slows-down'],
  'vpn-not-working-hotel-wifi': ['vpn-not-connecting', 'hysteria2-vs-vless', 'why-vpn-slows-down'],
  'why-vpn-slows-down': ['hysteria2-vs-vless', 'vpn-not-connecting', 'vpn-not-working-hotel-wifi'],
  'hysteria2-vs-vless': ['vpn-not-working-hotel-wifi', 'why-vpn-slows-down', 'subscription-link-explained'],
  'subscription-link-explained': ['vpn-iphone-ipad', 'vpn-android', 'vpn-windows-macos']
};

export const isBlogSlug = (slug: string): slug is BlogSlug => Object.hasOwn(POST_SECTIONS, slug);
