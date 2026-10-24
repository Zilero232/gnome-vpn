'use client';

import { useTranslations } from 'next-intl';

import { DeleteAccountCard } from '@/features/account/delete-account';
import { MarketingConsentSwitch } from '@/features/account/manage-consents';
import { ChangeEmailForm } from '@/features/auth/change-email';
import { ChangePasswordForm } from '@/features/auth/change-password';
import { UpdateNameForm } from '@/features/auth/update-name';
import { SectionHead } from '@/ui-kit';

import s from './SettingsCard.module.scss';

export const SettingsCard = () => {
  const t = useTranslations('account.settings');

  return (
    <div className={s.root}>
      <section className={s.section}>
        <SectionHead title={t('personal')} />

        <UpdateNameForm />
      </section>

      <section className={s.section}>
        <SectionHead title={t('mailing')} />

        <MarketingConsentSwitch />
      </section>

      <section className={s.section}>
        <SectionHead description={t('signInHint')} title={t('signIn')} />

        <div className={s.pair}>
          <ChangeEmailForm />

          <ChangePasswordForm />
        </div>
      </section>

      <DeleteAccountCard />
    </div>
  );
};
