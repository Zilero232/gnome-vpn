import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { BLOG_SLUGS } from '@/entities/app/blog';
import { blogPostRoute } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { Reveal, Text } from '@/ui-kit';
import { PageIntro } from '@/widgets/site/page-intro';

import s from './BlogPage.module.scss';

export const BlogPage = () => {
  const t = useTranslations('blog');

  return (
    <main className={s.root}>
      <PageIntro intro={t('intro')} title={t('title')} />

      <Reveal as='ol' className={s.list} kind='group'>
        {BLOG_SLUGS.map((slug, index) => (
          <Reveal key={slug} as='li' className={s.entry} kind='item'>
            <Link className={s.card} href={blogPostRoute(slug)}>
              <span aria-hidden className={s.index}>
                {String(index + 1).padStart(2, '0')}
              </span>

              <span className={s.cardBody}>
                <Text as='h2' className={s.cardTitle}>
                  {t(`posts.${slug}.title`)}
                </Text>
                <Text as='p' className={s.excerpt}>
                  {t(`posts.${slug}.excerpt`)}
                </Text>
              </span>

              <ArrowRight aria-hidden className={s.cardArrow} size={22} />
            </Link>
          </Reveal>
        ))}
      </Reveal>
    </main>
  );
};
