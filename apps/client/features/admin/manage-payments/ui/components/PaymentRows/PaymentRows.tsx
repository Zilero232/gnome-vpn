'use client';

import type { AdminPayment } from '@gnomevpn/schemas';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

import { DataTable, Text } from '@/ui-kit';

import type { PaymentRowsProps } from './PaymentRows.types';

import { useRefundPayment } from '../../../model/hooks';
import { RefundDialog } from '../RefundDialog';
import { usePaymentColumns } from './use-payment-columns';

export const PaymentRows = ({ payments, caption, withUser = true, isFaded }: PaymentRowsProps) => {
  const t = useTranslations('admin.payments');
  const refund = useRefundPayment();

  const [target, setTarget] = useState<AdminPayment | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const columns = usePaymentColumns({
    withUser,
    onRefund: (payment) => {
      setTarget(payment);
      setIsConfirmOpen(true);
    }
  });

  const onConfirm = () => {
    if (!target) {
      return;
    }

    refund.mutate(target.id, {
      onSuccess: () => {
        setIsConfirmOpen(false);
        toast.success(t('refund.requested'));
      }
    });
  };

  return (
    <>
      <DataTable
        empty={
          <Text size='sm' tone='muted'>
            {t('empty')}
          </Text>
        }
        caption={caption}
        columns={columns}
        isFaded={isFaded}
        rowKey={(payment) => payment.id}
        rows={payments}
      />

      <RefundDialog isOpen={isConfirmOpen} isPending={refund.isPending} payment={target} onConfirm={onConfirm} onOpenChange={setIsConfirmOpen} />
    </>
  );
};
