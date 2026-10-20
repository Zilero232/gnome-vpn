'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

import { REVEAL } from '@/shared/lib';
import { Text } from '@/ui-kit';

import type { StepCardProps } from './StepCard.types';

import { CONNECT_GUIDES } from '../../../../../config';
import { StepMoment } from './StepMoment';

import s from './StepCard.module.scss';

export const StepCard = ({ index, platform, step }: StepCardProps) => {
  const t = useTranslations('setup');

  return (
    <motion.li className={s.root} variants={REVEAL}>
      <span aria-hidden className={s.index}>
        {index + 1}
      </span>

      <Text as='h3' className={s.title}>
        {t(`steps.${step}.title`)}
      </Text>
      <Text as='p' className={s.body}>
        {t(`platforms.${CONNECT_GUIDES[platform.id]}.${step}`)}
      </Text>

      <div className={s.moment}>
        <StepMoment platform={platform} step={step} />
      </div>
    </motion.li>
  );
};
