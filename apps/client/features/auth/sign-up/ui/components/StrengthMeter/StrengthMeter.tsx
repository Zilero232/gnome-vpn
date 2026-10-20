import { useTranslations } from 'next-intl';

import type { StrengthMeterProps } from './StrengthMeter.types';

import { passwordStrength } from '../../../lib';

import s from './StrengthMeter.module.scss';

export const StrengthMeter = ({ password }: StrengthMeterProps) => {
  const t = useTranslations('auth.strength');

  if (password === '') {
    return null;
  }

  const strength = passwordStrength(password);

  return (
    <div aria-live='polite' className={s.root} data-strength={strength}>
      <span aria-hidden className={s.bar}>
        <span className={s.fill} />
      </span>
      <span className={s.text}>
        <span className={s.label}>{t('label')}: </span>
        {t(strength)}
      </span>
    </div>
  );
};
