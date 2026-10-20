import { useTranslations } from 'next-intl';
import { match } from 'ts-pattern';

import { Text } from '@/ui-kit';

import type { AuthReasonsProps } from './AuthReasons.types';

import { SIGN_UP_REASONS } from './AuthReasons.constants';

import s from './AuthReasons.module.scss';

export const AuthReasons = ({ mode }: AuthReasonsProps) => {
  const t = useTranslations('auth.reasons');

  return match(mode)
    .with('signup', () => (
      <div className={s.root}>
        <Text as='p' className={s.title}>
          {t('signupTitle')}
        </Text>
        <ul className={s.list}>
          {SIGN_UP_REASONS.map((reason) => (
            <li key={reason} className={s.item}>
              {t(reason)}
            </li>
          ))}
        </ul>
      </div>
    ))
    .with('signin', () => (
      <div className={s.root}>
        <Text as='p' className={s.title}>
          {t('signinTitle')}
        </Text>
        <Text as='p' className={s.body}>
          {t('signinBody')}
        </Text>
      </div>
    ))
    .with('forgot', () => (
      <div className={s.root}>
        <Text as='p' className={s.title}>
          {t('forgotTitle')}
        </Text>
        <Text as='p' className={s.body}>
          {t('forgotBody')}
        </Text>
      </div>
    ))
    .exhaustive();
};
