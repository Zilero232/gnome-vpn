'use client';

import { Menu } from '@base-ui/react/menu';
import { ChevronDown, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useHydrated } from '@/shared/lib';
import { Button } from '@/ui-kit';

import type { ShareMenuProps } from './ShareMenu.types';

import { SHARE_ICONS } from '../../../config';
import { shareTargets } from '../../../lib';

import s from './ShareMenu.module.scss';

export const ShareMenu = ({ url }: ShareMenuProps) => {
  const t = useTranslations('referrals');
  const isHydrated = useHydrated();

  const text = t('shareText');
  const canShareNatively = isHydrated && typeof navigator.share === 'function';

  const onNativeShare = async () => {
    try {
      await navigator.share({ url, text });
    } catch {}
  };

  if (canShareNatively) {
    return (
      <Button className={s.button} size='lg' type='button' onClick={() => void onNativeShare()}>
        <Share2 aria-hidden size={18} />
        {t('share')}
      </Button>
    );
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button className={s.button} size='lg' type='button'>
            <Share2 aria-hidden size={18} />
            {t('share')}
            <ChevronDown aria-hidden className={s.chevron} size={16} />
          </Button>
        }
      />

      <Menu.Portal>
        <Menu.Positioner align='start' className={s.positioner} sideOffset={8}>
          <Menu.Popup className={s.popup}>
            {shareTargets({ url, text, subject: t('emailSubject') }).map(({ key, href }) => {
              const Icon = SHARE_ICONS[key];

              return (
                <Menu.LinkItem key={key} className={s.item} href={href} rel='noopener noreferrer' target='_blank'>
                  <Icon aria-hidden size={16} />
                  {t(`targets.${key}`)}
                </Menu.LinkItem>
              );
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
};
