'use client';

import { useDebounceCallback } from '@siberiacancode/reactuse';
import { useEffect, useRef, useState } from 'react';

import type { FaqQueryState, UseFaqQueryInput } from './use-faq-query.types';

import { SEARCH } from '../../../config';
import { searchFaq } from '../../../lib';

const writeUrl = ({ query, topic }: FaqQueryState) => {
  const url = new URL(window.location.href);

  url.searchParams.delete(SEARCH.queryParam);
  url.searchParams.delete(SEARCH.topicParam);

  if (query.trim() !== '') {
    url.searchParams.set(SEARCH.queryParam, query);
  }

  if (topic) {
    url.searchParams.set(SEARCH.topicParam, topic);
  }

  window.history.replaceState(window.history.state, '', url);
};

export const useFaqQuery = ({ groups }: UseFaqQueryInput) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<string | null>(null);
  const [open, setOpen] = useState<string[]>([]);
  const [visible, setVisible] = useState<number>(SEARCH.pageSize);

  const syncUrl = useDebounceCallback(writeUrl, SEARCH.debounceMs);

  const apply = ({ query: nextQuery, topic: nextTopic }: FaqQueryState) => {
    const [first] = searchFaq({ groups, query: nextQuery, topic: nextTopic }).hits;

    setQuery(nextQuery);
    setTopic(nextTopic);
    setOpen(first ? [first.value] : []);
    setVisible(SEARCH.pageSize);
    syncUrl({ query: nextQuery, topic: nextTopic });
  };

  const applyRef = useRef(apply);

  applyRef.current = apply;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get(SEARCH.queryParam) ?? '';
    const initialTopic = params.get(SEARCH.topicParam);

    if (initialQuery !== '' || initialTopic) {
      applyRef.current({ query: initialQuery, topic: initialTopic });
    }

    const onKey = (event: KeyboardEvent) => {
      const isTyping = event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]') !== null;

      if (event.key === SEARCH.focusKey && !isTyping) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const result = searchFaq({ groups, query, topic });

  return {
    inputRef,
    query,
    topic,
    open,
    visible,
    result,
    setOpen,
    onShowMore: () => setVisible((count) => count + SEARCH.pageSize),
    onQueryChange: (next: string) => apply({ query: next, topic }),
    onTopicChange: (next: string | null) => apply({ query, topic: next })
  };
};
