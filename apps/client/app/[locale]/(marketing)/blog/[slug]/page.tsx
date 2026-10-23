import { Suspense } from 'react';

import { BLOG_SLUGS, isBlogSlug } from '@/entities/app/blog';
import { blogPostRoute } from '@/shared/constants';
import { LOCALES } from '@/shared/i18n';
import { translatedMetadata } from '@/shared/seo/translated-metadata';

import type { BlogPostParams } from './page.types';

import { Post } from './post';

export const ensureStatic = 'navigation';

export const generateStaticParams = () => LOCALES.flatMap((locale) => BLOG_SLUGS.map((slug) => ({ locale, slug })));

export const generateMetadata = async ({ params }: BlogPostParams) => {
  const { slug } = await params;

  if (!isBlogSlug(slug)) {
    return {};
  }

  return translatedMetadata({
    namespace: `blog.posts.${slug}`,
    path: blogPostRoute(slug),
    titleKey: 'title',
    descriptionKey: 'excerpt',
    isIndexed: true
  });
};

const Page = ({ params }: BlogPostParams) => (
  <Suspense>
    <Post params={params} />
  </Suspense>
);

export default Page;
