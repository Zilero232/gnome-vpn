import { useTranslations } from 'next-intl';

import { usePlatforms } from '@/entities/app/incy';
import { LinkCard, Text } from '@/ui-kit';

import type { IncySectionProps } from './IncySection.types';

import { SETUP_STEPS } from '../../../config';
import { SetupSteps } from '../SetupSteps';

import s from './IncySection.module.scss';

export const IncySection = ({ filter }: IncySectionProps) => {
  const t = useTranslations('setup');
  const tIncy = useTranslations('incy');
  const platforms = usePlatforms();

  const downloads = platforms.filter(({ id }) => filter.downloads.includes(id));

  return (
    <section className={s.root} id='incy'>
      <Text as='h2' className={s.title}>
        {t('incy.title')}
      </Text>
      <Text as='p' className={s.intro}>
        {t('incy.intro')}
      </Text>

      <div className={s.grid}>
        {downloads.map(({ id, icon, href }) => (
          <LinkCard key={id} hint={tIncy(`downloads.${id}`)} href={href} icon={icon} label={tIncy(`platforms.${id}`)} />
        ))}
      </div>

      <SetupSteps
        steps={SETUP_STEPS.map((step) => ({ key: step, title: t(`steps.${step}.title`), body: t(`platforms.${filter.incySteps}.${step}`) }))}
      />
    </section>
  );
};
