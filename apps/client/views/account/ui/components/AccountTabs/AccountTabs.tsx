'use client';

import type { KeyboardEvent } from 'react';

import { getHash, useHash } from '@siberiacancode/reactuse';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';
import { isNullish } from 'remeda';
import { match } from 'ts-pattern';

import type { AccountTabsProps } from './AccountTabs.types';

import { PILL_MOTION, TAB_PANEL_MOTION } from '../../AccountPage.motion';
import { TAB_KEYS } from './AccountTabs.constants';

import s from './AccountTabs.module.scss';

export const AccountTabs = ({ items, label, panelClassName }: AccountTabsProps) => {
  const baseId = useId();
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const [active, setActive] = useState(items[0]?.value ?? '');

  const tabForHash = (hash: string) => items.find((item) => item.value === hash || item.aliases?.includes(hash))?.value;

  const selectFromHash = (hash: string) => {
    const tab = tabForHash(hash);

    if (tab) {
      setActive(tab);
    }
  };

  const select = (value: string) => {
    setActive(value);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${value}`);
  };

  const tabHashes = items.map((item) => [item.value, ...(item.aliases ?? [])].join(',')).join(' ');

  useHash({ mode: 'initial', onChange: selectFromHash });

  useEffect(() => {
    const hash = getHash();
    const tab = tabHashes
      .split(' ')
      .map((hashes) => hashes.split(','))
      .find((hashes) => hashes.includes(hash));

    if (tab) {
      setActive(tab[0]);
    }
  }, [tabHashes]);

  const activeIndex = Math.max(
    items.findIndex((item) => item.value === active),
    0
  );

  const current = items[activeIndex];

  const tabId = (value: string) => `${baseId}-tab-${value}`;
  const panelId = (value: string) => `${baseId}-panel-${value}`;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const nextIndex = match(event.key)
      .when(
        (key) => TAB_KEYS.previous.has(key),
        () => activeIndex - 1
      )
      .when(
        (key) => TAB_KEYS.next.has(key),
        () => activeIndex + 1
      )
      .with('Home', () => 0)
      .with('End', () => items.length - 1)
      .otherwise(() => null);

    if (isNullish(nextIndex)) {
      return;
    }

    event.preventDefault();

    const index = (nextIndex + items.length) % items.length;

    select(items[index].value);
    tabsRef.current[index]?.focus();
  };

  return (
    <div className={s.root}>
      <div aria-label={label} className={s.nav} role='tablist' tabIndex={-1} onKeyDown={onKeyDown}>
        {items.map(({ value, label: tabLabel, icon: Icon }, index) => {
          const isActive = value === current?.value;

          return (
            <button
              key={value}
              ref={(node) => {
                tabsRef.current[index] = node;
              }}
              aria-controls={panelId(value)}
              aria-selected={isActive}
              className={s.tab}
              data-active={isActive}
              id={tabId(value)}
              role='tab'
              tabIndex={isActive ? 0 : -1}
              type='button'
              onClick={() => select(value)}
            >
              {isActive && <motion.span aria-hidden className={s.pill} layoutId={`${baseId}-pill`} transition={PILL_MOTION} />}

              <span className={s.label}>
                <Icon aria-hidden size={16} />
                {tabLabel}
              </span>
            </button>
          );
        })}
      </div>

      {current && (
        <motion.section
          key={current.value}
          animate='visible'
          aria-labelledby={tabId(current.value)}
          className={clsx(s.panel, !current.isBare && panelClassName)}
          id={panelId(current.value)}
          initial='hidden'
          role='tabpanel'
          tabIndex={0}
          variants={TAB_PANEL_MOTION}
        >
          {current.render()}
        </motion.section>
      )}
    </div>
  );
};
