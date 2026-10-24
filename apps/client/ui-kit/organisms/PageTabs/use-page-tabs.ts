'use client';

import { getHash, useDidUpdate, useEventListener, useHash, useMediaQuery, useResizeObserver } from '@siberiacancode/reactuse';
import { useEffect, useId, useRef, useState } from 'react';

import type { PageTabsEdges, UsePageTabsInput } from './PageTabs.types';

import { PAGE_TABS } from './PageTabs.constants';

export const usePageTabs = ({ items, layout }: UsePageTabsInput) => {
  const isWide = useMediaQuery(PAGE_TABS.railQuery);

  const [active, setActive] = useState(items[0]?.value ?? '');
  const [edges, setEdges] = useState<PageTabsEdges>({ start: false, end: false });

  const navRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<(HTMLElement | null)[]>([]);

  const pillId = useId();

  const tabForHash = (hash: string) => items.find((item) => item.value === hash || item.aliases?.includes(hash))?.value;

  const selectFromHash = (hash: string) => {
    const tab = tabForHash(hash);

    if (tab) {
      setActive(tab);
    }
  };

  const measureEdges = () => {
    const nav = navRef.current;

    if (!nav) {
      return;
    }

    const start = nav.scrollLeft > PAGE_TABS.edgeTolerance;
    const end = nav.scrollLeft + nav.clientWidth < nav.scrollWidth - PAGE_TABS.edgeTolerance;

    setEdges((previous) => (previous.start === start && previous.end === end ? previous : { start, end }));
  };

  const select = (value: string) => {
    setActive(value);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${value}`);
  };

  const tabsKey = items.map((item) => [item.value, ...(item.aliases ?? [])].join(',')).join('|');

  useHash({ mode: 'initial', onChange: selectFromHash });
  useEventListener(navRef, 'scroll', measureEdges, { passive: true });
  useResizeObserver(navRef, measureEdges);

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
  }, [current?.value, tabsKey]);

  return {
    current,
    navRef,
    tabsRef,
    pillId,
    edges,
    isVertical: layout === 'rail' && isWide,
    select
  };
};
