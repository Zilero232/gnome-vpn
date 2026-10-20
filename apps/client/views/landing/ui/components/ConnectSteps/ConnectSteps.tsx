'use client';

import type { PlatformId } from '@gnomevpn/schemas';

import { ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { usePlatforms } from '@/entities/app/incy';
import { ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { STAGGER } from '@/shared/lib';
import { Reveal, Text } from '@/ui-kit';

import { CONNECT_STEPS } from '../../../config';
import { PlatformPicker, StepCard } from './components';

import s from './ConnectSteps.module.scss';

export const ConnectSteps = () => {
  const t = useTranslations('landing.connect');
  const platforms = usePlatforms();

  const [platformId, setPlatformId] = useState<PlatformId>('ios');

  const platform = platforms.find(({ id }) => id === platformId) ?? platforms[0];

  return (
    <section aria-labelledby='how-title' className={s.root} id='how'>
      <Reveal className={s.head}>
        <Text as='h2' className={s.title} id='how-title'>
          {t('title')}
        </Text>
        <Text as='p' className={s.intro}>
          {t('intro')}
        </Text>
      </Reveal>

      <PlatformPicker platforms={platforms} value={platformId} onChange={setPlatformId} />

      <AnimatePresence initial={false} mode='wait'>
        <motion.ol key={platformId} animate='visible' className={s.steps} exit={{ opacity: 0, y: -8 }} initial='hidden' variants={STAGGER}>
          {CONNECT_STEPS.map((step, index) => (
            <StepCard key={step} index={index} platform={platform} step={step} />
          ))}
        </motion.ol>
      </AnimatePresence>

      <div className={s.footer}>
        <Link className={s.link} href={ROUTES.setup}>
          {t('setupLink')}
          <ArrowRight aria-hidden size={16} />
        </Link>
        <Link className={s.note} href={`${ROUTES.setup}#wireguard`}>
          {t('wireguard')}
        </Link>
      </div>
    </section>
  );
};
