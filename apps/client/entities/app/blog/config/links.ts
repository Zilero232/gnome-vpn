import { blogPostRoute, ROUTES } from '@/shared/constants';

import { BLOG_SLUGS } from './posts';

export const POST_LINKS: Readonly<Record<string, string>> = {
  setup: ROUTES.setup,
  pricing: ROUTES.pricing,
  status: ROUTES.status,
  faq: ROUTES.faq,
  ...Object.fromEntries(BLOG_SLUGS.map((slug) => [slug, blogPostRoute(slug)]))
};
