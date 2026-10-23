import { useTranslations } from 'next-intl';

import { TERMS_SUMMARY, TERMS_VALUES } from '../../../config';

import s from './TermsSummary.module.scss';

export const TermsSummary = () => {
  const t = useTranslations('terms.summary');

  return (
    <section aria-labelledby='terms-summary' className={s.root}>
      <h2 className={s.title} id='terms-summary'>
        {t('title')}
      </h2>

      <ul className={s.list}>
        {TERMS_SUMMARY.map((point) => (
          <li key={point}>{t(`points.${point}`, TERMS_VALUES)}</li>
        ))}
      </ul>

      <p className={s.note}>{t('note')}</p>
    </section>
  );
};
