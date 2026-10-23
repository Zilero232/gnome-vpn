'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { cancelAdminAutoRenew } from '@/shared/api';
import { Text } from '@/ui-kit';

import type { SubscriptionSectionProps } from './SubscriptionSection.types';

import { useUserAction } from '../../../model/hooks';
import { CardSection } from '../CardSection';
import { ConfirmAction } from '../ConfirmAction';
import { ExtendForm } from '../ExtendForm';
import { SubscriptionFacts } from './components';

export const SubscriptionSection = ({ userId, subscription }: SubscriptionSectionProps) => {
  const t = useTranslations('admin.user.subscription');
  const cancel = useUserAction(cancelAdminAutoRenew);

  return (
    <CardSection
      actions={
        subscription?.isAutoRenewOn && (
          <ConfirmAction
            confirmLabel={t('cancelRenewal.confirm')}
            description={t('cancelRenewal.body')}
            isPending={cancel.isPending}
            label={t('cancelRenewal.action')}
            title={t('cancelRenewal.title')}
            tone='danger'
            onConfirm={(close) =>
              cancel.mutate(userId, {
                onSuccess: () => {
                  close();
                  toast.success(t('cancelRenewal.done'));
                }
              })
            }
          />
        )
      }
      title={t('title')}
    >
      {subscription ? (
        <SubscriptionFacts subscription={subscription} />
      ) : (
        <Text size='sm' tone='muted'>
          {t('none')}
        </Text>
      )}

      <ExtendForm currentPeriodEnd={subscription?.currentPeriodEnd ?? null} userId={userId} />
    </CardSection>
  );
};
