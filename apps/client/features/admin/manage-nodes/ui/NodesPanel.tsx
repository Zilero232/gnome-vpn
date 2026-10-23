'use client';

import type { AdminNode } from '@gnomevpn/schemas';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

import { QueryBlock } from '@/entities/admin/records';
import { useCountryName } from '@/entities/app/country';
import { SectionHead, Text } from '@/ui-kit';

import { useAdminNodes, useSetNodeAvailability } from '../model/hooks';
import { AvailabilityDialog, NodeItem } from './components';

import s from './NodesPanel.module.scss';

export const NodesPanel = () => {
  const t = useTranslations('admin.nodes');
  const countryName = useCountryName();

  const { data: list, isPending, isRefetching, refetch } = useAdminNodes();
  const toggle = useSetNodeAvailability();

  const [target, setTarget] = useState<AdminNode | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const nameOf = (node: AdminNode) => countryName(node);

  const onConfirm = () => {
    if (!target) {
      return;
    }

    toggle.mutate(
      { id: target.id, isAvailable: !target.isAvailable },
      {
        onSuccess: (node) => {
          setIsConfirmOpen(false);
          toast.success(t(node.isAvailable ? 'putBackDone' : 'takeOutDone', { name: nameOf(node) }));
        }
      }
    );
  };

  return (
    <div className={s.root}>
      <SectionHead description={t('description')} title={t('title')} />

      <QueryBlock data={list} isPending={isPending} isRetrying={isRefetching} onRetry={() => void refetch()}>
        {({ nodes }) =>
          nodes.length > 0 ? (
            <ul className={s.list}>
              {nodes.map((node) => (
                <NodeItem
                  key={node.id}
                  isToggling={toggle.isPending && toggle.variables?.id === node.id}
                  name={nameOf(node)}
                  node={node}
                  onToggle={() => {
                    setTarget(node);
                    setIsConfirmOpen(true);
                  }}
                />
              ))}
            </ul>
          ) : (
            <Text size='sm' tone='muted'>
              {t('empty')}
            </Text>
          )
        }
      </QueryBlock>

      <AvailabilityDialog
        isOpen={isConfirmOpen}
        isPending={toggle.isPending}
        name={target ? nameOf(target) : ''}
        node={target}
        onConfirm={onConfirm}
        onOpenChange={setIsConfirmOpen}
      />
    </div>
  );
};
