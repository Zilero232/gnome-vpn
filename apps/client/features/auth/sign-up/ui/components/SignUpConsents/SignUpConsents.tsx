'use client';

import { useTranslations } from 'next-intl';

import { ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';

import type { SignUpConsentsProps } from './SignUpConsents.types';

import { ConsentCheckbox } from '../ConsentCheckbox';

import s from './SignUpConsents.module.scss';

export const SignUpConsents = ({ control, error }: SignUpConsentsProps) => {
  const t = useTranslations('auth');

  return (
    <div className={s.root}>
      <ConsentCheckbox control={control} error={error} name='isConsentGiven'>
        {t.rich('consentCheckbox', {
          consent: (chunks) => (
            <Link className={s.link} href={ROUTES.consent}>
              {chunks}
            </Link>
          )
        })}
      </ConsentCheckbox>

      <ConsentCheckbox control={control} name='isMarketingConsentGiven'>
        {t('marketingCheckbox')}
      </ConsentCheckbox>
    </div>
  );
};
