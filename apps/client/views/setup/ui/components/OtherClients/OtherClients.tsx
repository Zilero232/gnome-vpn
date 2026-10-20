import { CLIENT_REGISTRY } from '@gnomevpn/schemas';
import { useTranslations } from 'next-intl';
import { isEmpty } from 'remeda';

import { CLIENT_ICONS } from '@/entities/app/incy';
import { LinkCard, Text } from '@/ui-kit';

import type { OtherClientsProps } from './OtherClients.types';

import { OTHER_CLIENT_IDS, OTHER_CLIENT_STEPS } from '../../../config';
import { SetupSteps } from '../SetupSteps';

import s from './OtherClients.module.scss';

export const OtherClients = ({ filter }: OtherClientsProps) => {
  const t = useTranslations('setup.other');

  const clients = OTHER_CLIENT_IDS.filter((id) => CLIENT_REGISTRY[id].platforms.some((platform) => filter.downloads.includes(platform)));

  if (isEmpty(clients)) {
    return (
      <Text as='p' tone='muted'>
        {t('none')}
      </Text>
    );
  }

  return (
    <div className={s.root}>
      <Text as='p' tone='muted'>
        {t('intro')}
      </Text>

      <div className={s.grid}>
        {clients.map((id) => (
          <LinkCard
            key={id}
            hint={t(`clients.${id}.hint`)}
            href={CLIENT_REGISTRY[id].downloadUrl}
            icon={CLIENT_ICONS[id]}
            label={t(`clients.${id}.name`)}
          />
        ))}
      </div>

      <SetupSteps steps={OTHER_CLIENT_STEPS.map((step) => ({ key: step, title: t(`steps.${step}.title`), body: t(`steps.${step}.body`) }))} />

      <Text as='p' size='sm' tone='muted'>
        {t('note')}
      </Text>
    </div>
  );
};
