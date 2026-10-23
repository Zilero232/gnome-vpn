import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Text } from '@/ui-kit';

import { PRICING_INCLUDED } from '../../../config';

import s from './IncludedSection.module.scss';

export const IncludedSection = () => {
  const t = useTranslations('pricing');

  return (
    <section aria-labelledby='included-title' className={s.root}>
      <Text as='h2' className={s.title} id='included-title'>
        {t('includedTitle')}
      </Text>

      <ul className={s.list}>
        {PRICING_INCLUDED.map((item) => (
          <li key={item} className={s.item}>
            <Check aria-hidden className={s.check} size={18} />
            <span>{t(`included.${item}`)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
