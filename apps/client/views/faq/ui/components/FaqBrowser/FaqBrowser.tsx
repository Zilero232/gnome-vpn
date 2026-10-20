'use client';

import { useTranslations } from 'next-intl';
import { isEmpty } from 'remeda';

import { Text } from '@/ui-kit';

import type { FaqBrowserProps } from './FaqBrowser.types';

import { useFaqQuery } from '../../../model/hooks';
import { FaqEmpty } from '../FaqEmpty';
import { FaqFooter } from '../FaqFooter';
import { FaqGroups } from '../FaqGroups';
import { FaqResults } from '../FaqResults';
import { SearchBar } from '../SearchBar';
import { TopicChips } from '../TopicChips';

import s from './FaqBrowser.module.scss';

export const FaqBrowser = ({ groups }: FaqBrowserProps) => {
  const t = useTranslations('faq.search');
  const { inputRef, query, topic, open, visible, result, setOpen, onShowMore, onQueryChange, onTopicChange } = useFaqQuery({ groups });

  const topics = groups.map(({ key, title }) => ({ key, title }));
  const isSearching = !isEmpty(result.terms);
  const isFiltered = isSearching || topic !== null;

  return (
    <div className={s.root}>
      <div className={s.controls}>
        <SearchBar inputRef={inputRef} value={query} onChange={onQueryChange} />
        <TopicChips topics={topics} value={topic} onChange={onTopicChange} />
      </div>

      <Text aria-live='polite' as='p' className={s.count} role='status'>
        {isFiltered && result.count > 0 && t('count', { count: result.count })}
      </Text>

      {result.count === 0 && <FaqEmpty />}

      {isSearching && result.count > 0 && (
        <FaqResults hits={result.hits} open={open} terms={result.terms} visible={visible} onOpenChange={setOpen} onShowMore={onShowMore} />
      )}

      {!isSearching && <FaqGroups groups={result.groups} open={open} onOpenChange={setOpen} />}

      {result.count > 0 && <FaqFooter />}
    </div>
  );
};
