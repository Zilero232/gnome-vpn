'use client';

import { useTranslations } from 'next-intl';

import { useAdminFormat } from '@/entities/admin/records';
import { UptimeStrip } from '@/entities/vpn/node-status';
import { Badge, Button, CountryFlag, FactList, Text } from '@/ui-kit';

import type { NodeItemProps } from './NodeItem.types';

import { NODE_STATE_TONE } from '../../../config';

import s from './NodeItem.module.scss';

export const NodeItem = ({ node, name, isToggling, onToggle }: NodeItemProps) => {
  const t = useTranslations('admin.nodes');
  const states = useTranslations('status.states');
  const protocols = useTranslations('status.protocols');
  const format = useAdminFormat();

  const never = t('facts.never');

  const facts = [
    { key: 'host', label: t('facts.host'), value: `${node.host}:${node.port}`, isMono: true },
    { key: 'protocols', label: t('facts.protocols'), value: node.protocols.map((protocol) => protocols(protocol)).join(', ') },
    { key: 'healthy', label: t('facts.healthy'), value: node.lastHealthyAt ? format.dateTime(node.lastHealthyAt) : never },
    { key: 'checked', label: t('facts.checked'), value: node.checkedAt ? format.dateTime(node.checkedAt) : never }
  ];

  return (
    <li className={s.root} data-available={node.isAvailable}>
      <div className={s.head}>
        <CountryFlag className={s.flag} countryCode={node.countryCode} size='lg' />

        <div className={s.place}>
          <Text as='h3' className={s.name}>
            {name}
          </Text>

          {node.city && (
            <Text as='span' size='xs' tone='muted'>
              {node.city}
            </Text>
          )}
        </div>

        <div className={s.badges}>
          {node.isAvailable ? <Badge tone={NODE_STATE_TONE[node.state]}>{states(node.state)}</Badge> : <Badge tone='muted'>{t('off')}</Badge>}
          {node.isOverloaded && <Badge tone='warning'>{t('overloaded')}</Badge>}
        </div>
      </div>

      <FactList items={facts} />

      <UptimeStrip days={node.days} uptime={node.uptime} />

      <div className={s.actions}>
        <Button disabled={isToggling} size='md' variant={node.isAvailable ? 'ghost' : 'primary'} onClick={onToggle}>
          {node.isAvailable ? t('takeOut') : t('putBack')}
        </Button>
      </div>
    </li>
  );
};
