import { useTranslations } from 'next-intl';

import { ACCOUNT_TAB, ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { Accordion, StepList, Text } from '@/ui-kit';

import type { WireguardSectionProps } from './WireguardSection.types';

import { WIREGUARD_SETUP_STEPS } from '../../../config';
import { WireguardApps } from '../WireguardApps';

import s from './WireguardSection.module.scss';

export const WireguardSection = ({ filter }: WireguardSectionProps) => {
  const t = useTranslations('setup');

  return (
    <section className={s.root} id='wireguard'>
      <Text as='h2' className={s.title}>
        {t('wireguard.title')}
      </Text>
      <Text as='p' className={s.intro}>
        {t('wireguard.intro')}
      </Text>

      <WireguardApps />

      <Accordion
        items={filter.wireguard.map((platform) => ({
          value: platform,
          title: t('wireguard.stepsFor', { platform: t(`wireguard.platforms.${platform}.name`) }),
          content: (
            <StepList
              steps={WIREGUARD_SETUP_STEPS.map((step) => ({
                key: step,
                title: t(`wireguardSteps.${step}`),
                description: t(`wireguard.platforms.${platform}.${step}`)
              }))}
            />
          )
        }))}
      />

      <Link className={s.link} href={`${ROUTES.account}#${ACCOUNT_TAB.wireguard}`}>
        {t('wireguard.cta')}
      </Link>
    </section>
  );
};
