'use client';

import { min } from 'date-fns';
import { useFormatter, useNow, useTranslations } from 'next-intl';
import { isNonNullish } from 'remeda';

import { useCountryName } from '@/entities/app/country';
import { UptimeStrip } from '@/entities/vpn/node-status';
import { Badge, CountryFlag, Text } from '@/ui-kit';

import type { NodeCardProps } from './NodeCard.types';

import { CHECKED_TICK_MS, STATE_BADGE } from './NodeCard.constants';

import s from './NodeCard.module.scss';

export const NodeCard = ({ node }: NodeCardProps) => {
  const t = useTranslations('status');
  const format = useFormatter();
  const now = useNow({ updateInterval: CHECKED_TICK_MS });
  const countryName = useCountryName();

  const checked = isNonNullish(node.checkedAt)
    ? t('nodes.checkedAgo', { time: format.relativeTime(min([new Date(node.checkedAt), now]), now) })
    : t('nodes.neverChecked');

  return (
    <li className={s.root} data-state={node.state}>
      <div className={s.head}>
        <CountryFlag className={s.flag} countryCode={node.countryCode} size='lg' />

        <Text as='h3' className={s.country}>
          {countryName(node)}
        </Text>

        <Badge className={s.state} tone={STATE_BADGE[node.state]}>
          {t(`states.${node.state}`)}
        </Badge>

        <Text as='span' className={s.checked} size='xs' tone='muted'>
          {checked}
        </Text>
      </div>

      <ul aria-label={t('protocols.label')} className={s.protocols}>
        {node.protocols.map((protocol) => (
          <li key={protocol} className={s.protocol}>
            {t(`protocols.${protocol}`)}
          </li>
        ))}
      </ul>

      <UptimeStrip days={node.days} uptime={node.uptime} />
    </li>
  );
};
