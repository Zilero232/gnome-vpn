'use client';

import { useMediaQuery } from '@siberiacancode/reactuse';
import { useTranslations } from 'next-intl';

import { TOUCH_DEVICE_QUERY } from '@/shared/constants';
import { StepList } from '@/ui-kit';

import type { LinkStepsProps } from './LinkSteps.types';

import { LinkActions } from '../LinkActions';

export const LinkSteps = ({ client }: LinkStepsProps) => {
  const t = useTranslations('incy');
  const isTouchDevice = useMediaQuery(TOUCH_DEVICE_QUERY);

  const app = t(`clients.${client.id}`);
  const openHref = isTouchDevice ? client.importUrl : null;

  return (
    <StepList
      steps={[
        {
          key: 'copy',
          title: openHref ? t('steps.open', { app }) : t('steps.copy'),
          children: <LinkActions key={client.id} app={app} openHref={openHref} value={client.copyUrl} />
        },
        { key: 'paste', title: t('steps.paste', { app }), description: t(`paste.${client.id}`) },
        { key: 'connect', title: t('steps.connect'), description: t('steps.connectHint') }
      ]}
      variant='panel'
    />
  );
};
