'use client';

import { useTranslations } from 'next-intl';

import { Badge, StepList, Text } from '@/ui-kit';

import type { ConfigStepsProps } from './ConfigSteps.types';

import { CreateConfigForm } from '../CreateConfigForm';

import s from './ConfigSteps.module.scss';

export const ConfigSteps = ({ overview, target, onCreated }: ConfigStepsProps) => {
  const t = useTranslations('wireguard');

  const isFull = overview.deviceCount >= overview.deviceLimit;

  return (
    <StepList
      steps={[
        {
          key: 'create',
          title: t('steps.create'),
          aside: <Badge tone={isFull ? 'danger' : 'muted'}>{t('slots', { count: overview.deviceCount, limit: overview.deviceLimit })}</Badge>,
          children:
            overview.nodes.length === 0 ? (
              <Text as='p' className={s.empty} size='sm' tone='muted'>
                {t('noServers')}
              </Text>
            ) : (
              <CreateConfigForm isFull={isFull} nodes={overview.nodes} onCreated={onCreated} />
            )
        },
        { key: 'import', title: t(`targets.${target}.title`), description: t(`targets.${target}.import`) },
        { key: 'connect', title: t('steps.connect'), description: t(`targets.${target}.connect`) }
      ]}
      variant='panel'
    />
  );
};
