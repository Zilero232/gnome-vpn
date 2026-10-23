'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { telegramHandle, useAdminFormat } from '@/entities/admin/records';
import { verifyAdminEmail } from '@/shared/api';
import { Badge, FactList } from '@/ui-kit';

import type { ProfileSectionProps } from './ProfileSection.types';

import { useUserAction } from '../../../model/hooks';
import { CardSection } from '../CardSection';
import { ConfirmAction } from '../ConfirmAction';
import { TelegramMessage } from '../TelegramMessage';

import s from './ProfileSection.module.scss';

export const ProfileSection = ({ profile }: ProfileSectionProps) => {
  const t = useTranslations('admin.user.profile');
  const format = useAdminFormat();
  const verify = useUserAction(verifyAdminEmail);

  const { telegram } = profile;

  const facts = [
    { key: 'name', label: t('name'), value: profile.name || '—' },
    {
      key: 'email',
      label: t('email'),
      value: (
        <>
          {profile.hasEmail ? profile.email : t('noEmail')}
          {profile.hasEmail && (
            <Badge tone={profile.emailVerified ? 'accent' : 'warning'}>{t(profile.emailVerified ? 'verified' : 'unverified')}</Badge>
          )}
        </>
      )
    },
    { key: 'id', label: t('id'), value: profile.id, isMono: true },
    { key: 'created', label: t('created'), value: format.dateTime(profile.createdAt) },
    { key: 'locale', label: t('locale'), value: profile.locale ?? '—' },
    { key: 'telegram', label: t('telegram'), value: telegram ? telegramHandle(telegram) : t('noTelegram') },
    ...(telegram ? [{ key: 'botSeen', label: t('botSeen'), value: telegram.lastSeenAt ? format.dateTime(telegram.lastSeenAt) : '—' }] : [])
  ];

  const canVerify = profile.hasEmail && !profile.emailVerified;

  return (
    <CardSection
      actions={
        canVerify && (
          <ConfirmAction
            confirmLabel={t('verify.confirm')}
            description={t('verify.body', { email: profile.email })}
            isPending={verify.isPending}
            label={t('verify.action')}
            title={t('verify.title')}
            onConfirm={(close) =>
              verify.mutate(profile.id, {
                onSuccess: () => {
                  close();
                  toast.success(t('verify.done'));
                }
              })
            }
          />
        )
      }
      title={t('title')}
    >
      <FactList items={facts} />

      {telegram && <TelegramMessage className={s.message} userId={profile.id} />}
    </CardSection>
  );
};
