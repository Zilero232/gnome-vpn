import { ROUTES } from './routes';

export const SITE_NAV = [
  { key: 'pricing', href: ROUTES.pricing },
  { key: 'setup', href: ROUTES.setup },
  { key: 'servers', href: ROUTES.servers },
  { key: 'blog', href: ROUTES.blog },
  { key: 'faq', href: ROUTES.faq },
  { key: 'about', href: ROUTES.about }
] as const;

export const FOOTER_NAV = [
  { key: 'pricing', href: ROUTES.pricing },
  { key: 'setup', href: ROUTES.setup },
  { key: 'servers', href: ROUTES.servers },
  { key: 'blog', href: ROUTES.blog },
  { key: 'faq', href: ROUTES.faq },
  { key: 'about', href: ROUTES.about },
  { key: 'privacy', href: ROUTES.privacy }
] as const;

export const FOOTER_GROUPS = [
  { key: 'product', links: [FOOTER_NAV[0], FOOTER_NAV[1], FOOTER_NAV[2]] },
  { key: 'help', links: [FOOTER_NAV[4], FOOTER_NAV[3], FOOTER_NAV[5]] },
  { key: 'legal', links: [FOOTER_NAV[6]] }
] as const;
