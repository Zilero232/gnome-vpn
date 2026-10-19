import { useTranslations } from 'next-intl';

import { Text } from '@/ui-kit';

import { INVITE_STEPS } from '../../../config';

import s from './InviteSteps.module.scss';

export const InviteSteps = () => {
  const t = useTranslations('referrals');

  return (
    <section className={s.root}>
      <Text as='h3' className={s.title} size='sm'>
        {t('stepsTitle')}
      </Text>

      <ol className={s.list}>
        {INVITE_STEPS.map(({ key, icon: Icon }, index) => (
          <li key={key} className={s.step}>
            <span aria-hidden className={s.badge}>
              <Icon size={18} />
              <span className={s.number}>{index + 1}</span>
            </span>

            <span className={s.body}>
              <span className={s.stepTitle}>{t(`steps.${key}.title`)}</span>
              <span className={s.stepText}>{t(`steps.${key}.text`)}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
};
