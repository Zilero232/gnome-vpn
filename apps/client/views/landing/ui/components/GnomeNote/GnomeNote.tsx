import { useTranslations } from 'next-intl';

import { AUTH_MODE, QUERY_PARAMS, ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { buttonVariants, Reveal, Text } from '@/ui-kit';

import { NOTE_PARAGRAPHS } from '../../../config';
import { WavingGnome } from './components';

import s from './GnomeNote.module.scss';

export const GnomeNote = () => {
  const t = useTranslations('landing.note');

  return (
    <section aria-labelledby='note-title' className={s.root}>
      <div className={s.gnome}>
        <WavingGnome />
      </div>

      <Reveal className={s.letter}>
        <Text as='h2' className={s.title} id='note-title'>
          {t('title')}
        </Text>

        <div className={s.body}>
          {NOTE_PARAGRAPHS.map((paragraph) => (
            <Text key={paragraph} as='p' className={s.text}>
              {t(paragraph)}
            </Text>
          ))}
        </div>

        <div className={s.footer}>
          <Text as='p' className={s.signature}>
            — {t('signature')}
          </Text>

          <Link
            className={buttonVariants({ size: 'md', class: s.cta })}
            href={{ pathname: ROUTES.account, query: { [QUERY_PARAMS.mode]: AUTH_MODE.signup } }}
          >
            {t('cta')}
          </Link>
        </div>
      </Reveal>
    </section>
  );
};
