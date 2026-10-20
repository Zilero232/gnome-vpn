import { createTranslator } from 'next-intl';
import { describe, expect, it } from 'vitest';

import { FAQ_ANSWER_VALUES, FAQ_GROUPS } from '@/entities/app/faq';
import { messages } from '@/shared/i18n';

import { SEARCH } from '../../../config';
import { expandTerms, highlight, queryWords, searchFaq } from '../faq-search';

const faqGroups = (locale: 'en' | 'ru') => {
  const t = createTranslator({ locale, messages: messages[locale], namespace: 'faq' });

  return FAQ_GROUPS.map(({ key, questions }) => ({
    key,
    title: t(`groups.${key}`),
    items: questions.map((value) => ({ value, question: t(`questions.${value}.q`), answer: t(`questions.${value}.a`, FAQ_ANSWER_VALUES) }))
  }));
};

const ru = faqGroups('ru');
const en = faqGroups('en');

const hits = (query: string, groups = ru) => searchFaq({ groups, query, topic: null }).hits.map(({ value }) => value);

describe('queryWords', () => {
  it('drops the words every question shares', () => {
    expect(queryWords('Сколько стоит у вас?')).toEqual(['стоит']);
    expect(queryWords('How much does it cost')).toEqual(['cost']);
  });
});

describe('searchFaq on the real questions', () => {
  it('finds the refund and nothing about the free day for «вернуть деньги»', () => {
    expect(hits('вернуть деньги')).toEqual(['refund']);
  });

  it('puts the price question first for «сколько стоит», and keeps the list short', () => {
    const result = hits('сколько стоит');

    expect(result[0]).toBe('price');
    expect(result.length).toBeLessThanOrEqual(SEARCH.pageSize);
    expect(hits('how much does it cost', en)[0]).toBe('price');
  });

  it('forgives one typo', () => {
    expect(hits('торент')).toEqual(['torrents']);
    expect(hits('torent', en)).toEqual(['torrents']);
  });

  it('expands synonyms in both languages', () => {
    expect(hits('возврат')).toContain('refund');
    expect(hits('refund', en)).toContain('refund');
    expect(hits('телевизор')).toContain('whatIsIncy');
    expect(hits('отменить автопродление')).toEqual(['autoRenew']);
  });

  it('ranks the question that says it exactly first', () => {
    expect(hits('не подключается')[0]).toBe('notConnecting');
  });

  it('returns no hits for a query made only of stop words, and leaves the groups whole', () => {
    const result = searchFaq({ groups: ru, query: 'как', topic: null });

    expect(result.hits).toEqual([]);
    expect(result.terms).toEqual([]);
    expect(result.count).toBe(ru.reduce((sum, { items }) => sum + items.length, 0));
  });

  it('narrows to a topic and combines it with the query', () => {
    expect(searchFaq({ groups: ru, query: '', topic: 'usage' }).groups.map(({ key }) => key)).toEqual(['usage']);
    expect(searchFaq({ groups: ru, query: 'деньги', topic: 'usage' }).hits).toEqual([]);
  });

  it('counts the hits', () => {
    const result = searchFaq({ groups: ru, query: 'сколько стоит', topic: null });

    expect(result.count).toBe(result.hits.length);
  });
});

describe('highlight', () => {
  it('marks the words that matched and keeps the original text', () => {
    const segments = highlight({ text: 'Можно ли вернуть деньги?', terms: expandTerms('деньгами') });

    expect(segments.map(({ text }) => text).join('')).toBe('Можно ли вернуть деньги?');
    expect(segments.filter(({ isMatch }) => isMatch).map(({ text }) => text)).toEqual(['вернуть', 'деньги']);
  });
});
