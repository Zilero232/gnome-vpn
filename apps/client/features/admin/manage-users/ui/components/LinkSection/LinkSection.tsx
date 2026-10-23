'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useAdminFormat } from '@/entities/admin/records';
import { rotateAdminLink } from '@/shared/api';
import { FactList, Text } from '@/ui-kit';

import type { LinkSectionProps } from './LinkSection.types';

import { useUserAction } from '../../../model/hooks';
import { CardSection } from '../CardSection';
import { ConfirmAction } from '../ConfirmAction';

export const LinkSection = ({ userId, link }: LinkSectionProps) => {
  const t = useTranslations('admin.user.link');
  const format = useAdminFormat();
  const rotate = useUserAction(rotateAdminLink);

  return (
    <CardSection
      actions={
        <ConfirmAction
          confirmLabel={t('rotate.confirm')}
          description={t('rotate.body')}
          isPending={rotate.isPending}
          label={t('rotate.action')}
          title={t('rotate.title')}
          tone='danger'
          onConfirm={(close) =>
            rotate.mutate(userId, {
              onSuccess: () => {
                close();
                toast.success(t('rotate.done'));
              }
            })
          }
        />
      }
      description={t('description')}
      title={t('title')}
    >
      {link ? (
        <FactList
          items={[
            { key: 'created', label: t('created'), value: format.dateTime(link.createdAt) },
            { key: 'seen', label: t('seen'), value: link.lastSeenAt ? format.dateTime(link.lastSeenAt) : t('never') },
            { key: 'platform', label: t('platform'), value: link.lastPlatform ?? '—' }
          ]}
        />
      ) : (
        <Text size='sm' tone='muted'>
          {t('none')}
        </Text>
      )}
    </CardSection>
  );
};
