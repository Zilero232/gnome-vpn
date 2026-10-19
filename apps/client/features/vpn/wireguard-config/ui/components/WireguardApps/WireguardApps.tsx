import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Text } from '@/ui-kit';

import { WIREGUARD_APPS } from '../../../config';

import s from './WireguardApps.module.scss';

export const WireguardApps = () => {
  const t = useTranslations('wireguard');

  return (
    <section className={s.root}>
      <Text as='h3' className={s.title} size='sm'>
        {t('appsTitle')}
      </Text>

      <ul className={s.list}>
        {WIREGUARD_APPS.map(({ id, links }) => (
          <li key={id} className={s.app}>
            <span className={s.head}>
              <span className={s.name}>{t(`apps.${id}.name`)}</span>
              <span className={s.platform}>{t(`apps.${id}.platform`)}</span>
            </span>

            <Text as='p' size='xs' tone='muted'>
              {t(`apps.${id}.hint`)}
            </Text>

            <span className={s.links}>
              {links.map(({ store, href }) => (
                <a key={store} className={s.link} href={href} rel='noopener noreferrer' target='_blank'>
                  {t(`stores.${store}`)}
                  <ExternalLink aria-hidden size={13} />
                </a>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};
