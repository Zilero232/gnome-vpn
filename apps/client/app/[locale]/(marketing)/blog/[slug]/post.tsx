import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import * as rootParams from 'next/root-params';

import { isBlogSlug } from '@/entities/app/blog';
import { blogPostRoute } from '@/shared/constants';
import { resolveLocale } from '@/shared/i18n';
import { articleJsonLd, JsonLd, PageJsonLd } from '@/shared/seo';
import { BlogPostPage } from '@/views/blog-post';

import type { BlogPostParams } from './page.types';

export const Post = async ({ params }: BlogPostParams) => {
  const { slug } = await params;

  if (!isBlogSlug(slug)) {
    notFound();
  }

  const locale = resolveLocale(await rootParams.locale());
  const t = await getTranslations({ locale, namespace: `blog.posts.${slug}` });

  return (
    <>
      <PageJsonLd locale={locale} name={t('title')} path={blogPostRoute(slug)} />

      <JsonLd data={articleJsonLd({ headline: t('title'), description: t('excerpt'), path: blogPostRoute(slug), locale })} />

      <BlogPostPage slug={slug} />
    </>
  );
};
