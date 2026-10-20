'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

import { IN_VIEW } from '@/shared/lib';
import { CountryFlag } from '@/ui-kit';

import { LOCATIONS } from '../../../../../config';
import { FADE_IN_LATE, KNOB, PHONE } from './PhoneMock.motion';

import s from './PhoneMock.module.scss';

export const PhoneMock = () => {
  const t = useTranslations('landing');

  return (
    <div aria-hidden className={s.stage}>
      <motion.div className={s.phone} initial='hidden' variants={PHONE} viewport={IN_VIEW} whileHover='flat' whileInView='visible'>
        <span className={s.notch} />

        <div className={s.head}>
          <span className={s.app}>{t('phone.title')}</span>
          <span className={s.toggle}>
            <motion.span className={s.toggleOn} variants={FADE_IN_LATE} />
            <motion.span className={s.knob} variants={KNOB} />
          </span>
        </div>

        <motion.span className={s.status} variants={FADE_IN_LATE}>
          <span className={s.dot} />
          {t('phone.connected')}
          <span className={s.protocol}>{t('phone.protocol')}</span>
        </motion.span>

        <ul className={s.list}>
          {LOCATIONS.map((location, index) => (
            <li key={location.code} className={s.row}>
              {index === 0 && <motion.span className={s.rowActive} variants={FADE_IN_LATE} />}
              <CountryFlag className={s.flag} countryCode={location.code} size='sm' />
              <span className={s.place}>
                <span className={s.country}>{t(`locations.${location.key}Name`)}</span>
                <span className={s.city}>{t(`locations.${location.key}City`)}</span>
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};
