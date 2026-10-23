import type { ReactNode } from 'react';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { mapValues } from 'remeda';

import { POST_LINKS, POST_RELATED, POST_SECTIONS } from '@/entities/app/blog';
import { blogPostRoute, ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { GnomeBadge, Text } from '@/ui-kit';
import { RelatedLinks } from '@/widgets/site/related-links';

import type { BlogPostPageProps } from './BlogPostPage.types';

import s from './BlogPostPage.module.scss';

const LINK_TAGS = mapValues(POST_LINKS, (href) => (chunks: ReactNode) => (
  <Link className={s.link} href={href}>
    {chunks}
  </Link>
));

export const BlogPostPage = ({ slug }: BlogPostPageProps) => {
  const t = useTranslations(`blog.posts.${slug}`);
  const tBlog = useTranslations('blog');

  return (
    <main className={s.root}>
      <article className={s.article}>
        <header className={s.head}>
          <Link className={s.back} href={ROUTES.blog}>
            <ArrowLeft aria-hidden size={14} />
            {tBlog('back')}
          </Link>

          <Text as='h1' className={s.title}>
            {t('title')}
          </Text>

          <Text as='p' className={s.intro}>
            {t('intro')}
          </Text>
        </header>

        {POST_SECTIONS[slug].map((section) => (
          <section key={section} className={s.section}>
            <Text as='h2' className={s.heading}>
              {t(`sections.${section}.title`)}
            </Text>

            <Text as='p' className={s.body}>
              {t.rich(`sections.${section}.body`, LINK_TAGS)}
            </Text>
          </section>
        ))}
      </article>

      <RelatedLinks links={POST_RELATED[slug].map((other) => ({ href: blogPostRoute(other), label: tBlog(`posts.${other}.title`) }))} />

      <aside className={s.cta}>
        <GnomeBadge size={56} />
        <div className={s.ctaText}>
          <Text as='p' className={s.body}>
            {tBlog('cta')}
          </Text>
          <Link className={s.ctaLink} href={ROUTES.pricing}>
            {tBlog('ctaAction')}
          </Link>
        </div>
      </aside>
    </main>
  );
};
