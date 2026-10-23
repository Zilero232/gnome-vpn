'use client';

import type { KeyboardEvent } from 'react';

import { getHash, useDidUpdate, useHash } from '@siberiacancode/reactuse';
import { useEffect, useId, useRef, useState } from 'react';
import { isNullish } from 'remeda';
import { match } from 'ts-pattern';

import type { PageTab } from './PageTabs.types';

import { TAB_KEYS } from './PageTabs.constants';

export const usePageTabs = (items: PageTab[]) => {
  const baseId = useId();
  const navRef = useRef<HTMLDivElement>(null);
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

  const tabsKey = items.map((item) => [item.value, ...(item.aliases ?? [])].join(',')).join('|');

  useHash({ mode: 'initial', onChange: selectFromHash });

  // eslint-disable-next-line react/exhaustive-deps -- tabsKey stands for items, which is a fresh array on every render
  useEffect(() => selectFromHash(getHash()), [tabsKey]);

  const activeIndex = Math.max(
    items.findIndex((item) => item.value === active),
    0
  );

  const current = items.at(activeIndex);

  useDidUpdate(() => {
    const nav = navRef.current;
    const tab = tabsRef.current[activeIndex];

    if (!nav || !tab) {
      return;
    }

    const offset = tab.getBoundingClientRect().left - nav.getBoundingClientRect().left;

    nav.scrollTo({ left: nav.scrollLeft + offset - (nav.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' });
  }, [current?.value]);

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

  return {
    current,
    navRef,
    tabsRef,
    tabId: (value: string) => `${baseId}-tab-${value}`,
    panelId: (value: string) => `${baseId}-panel-${value}`,
    pillId: `${baseId}-pill`,
    select,
    onKeyDown
  };
};
