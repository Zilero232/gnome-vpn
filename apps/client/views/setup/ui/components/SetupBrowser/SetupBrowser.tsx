'use client';

import { useMount } from '@siberiacancode/reactuse';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Text } from '@/ui-kit';

import type { SetupPick } from '../../../lib';

import { SETUP_FILTER } from '../../../config';
import { platformFromAgent } from '../../../lib';
import { IncySection } from '../IncySection';
import { OtherClients } from '../OtherClients';
import { PlatformPicker } from '../PlatformPicker';
import { WireguardSection } from '../WireguardSection';

import s from './SetupBrowser.module.scss';

export const SetupBrowser = () => {
  const t = useTranslations('setup');

  const [pick, setPick] = useState<SetupPick>('iphone');

  useMount(() => setPick(platformFromAgent(window.navigator.userAgent)));

  const filter = SETUP_FILTER[pick];

  return (
    <div className={s.root}>
      <PlatformPicker value={pick} onChange={setPick} />

      <IncySection filter={filter} />

      <section className={s.section} id='apps'>
        <Text as='h2' className={s.sectionTitle}>
          {t('other.title')}
        </Text>
        <OtherClients filter={filter} />
      </section>

      <WireguardSection filter={filter} />
    </div>
  );
};
