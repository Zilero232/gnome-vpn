import { useTranslations } from 'next-intl';
import { match } from 'ts-pattern';

import { AuthAside } from '@/widgets/auth/auth-shell';

import type { AuthReasonsProps } from './AuthReasons.types';

import { SIGN_UP_REASONS } from './AuthReasons.constants';

import s from './AuthReasons.module.scss';

export const AuthReasons = ({ mode }: AuthReasonsProps) => {
  const t = useTranslations('auth.reasons');

  return match(mode)
    .with('signup', () => (
      <AuthAside title={t('signupTitle')}>
        <ul className={s.list}>
          {SIGN_UP_REASONS.map((reason) => (
            <li key={reason} className={s.item}>
              {t(reason)}
            </li>
          ))}
        </ul>
      </AuthAside>
    ))
    .with('signin', () => <AuthAside body={t('signinBody')} title={t('signinTitle')} />)
    .with('forgot', () => <AuthAside body={t('forgotBody')} title={t('forgotTitle')} />)
    .exhaustive();
};
