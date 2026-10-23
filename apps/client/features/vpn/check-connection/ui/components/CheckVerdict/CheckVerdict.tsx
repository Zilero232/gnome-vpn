'use client';

import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { isNonNullish } from 'remeda';
import { match, P } from 'ts-pattern';

import { useCountryName } from '@/entities/app/country';
import { ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { CountryFlag, StatusIcon, Text } from '@/ui-kit';

import type { CheckVerdictProps } from './CheckVerdict.types';

import s from './CheckVerdict.module.scss';

export const CheckVerdict = ({ verdict }: CheckVerdictProps) => {
  const t = useTranslations('status.check');
  const countryName = useCountryName();

  const title = match(verdict)
    .with({ viaGnome: true, countryCode: P.string }, ({ countryCode }) => t('via', { country: countryName({ countryCode }) }))
    .with({ viaGnome: true }, () => t('viaNoCountry'))
    .otherwise(() => t('notVia'));

  return (
    <div className={s.root} data-via={verdict.viaGnome}>
      <StatusIcon className={s.icon} tone={verdict.viaGnome ? 'accent' : 'danger'}>
        {verdict.viaGnome ? <ShieldCheck size={22} /> : <ShieldAlert size={22} />}
      </StatusIcon>

      <div className={s.body}>
        <Text as='p' className={s.title} weight='semibold'>
          {isNonNullish(verdict.countryCode) && <CountryFlag className={s.flag} countryCode={verdict.countryCode} size='sm' />}
          {title}
        </Text>

        <Text as='p' size='sm' tone='muted'>
          {t('ip', { ip: verdict.ip })}
        </Text>

        {!verdict.viaGnome && (
          <Text as='p' size='sm'>
            {t('notViaHint')}{' '}
            <Link className={s.link} href={ROUTES.setup}>
              {t('setup')}
            </Link>
          </Text>
        )}
      </div>
    </div>
  );
};
