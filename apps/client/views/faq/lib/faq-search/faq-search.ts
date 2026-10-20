import { isEmpty, sumBy } from 'remeda';

import type {
  FaqHit,
  HighlightInput,
  HighlightSegment,
  MatchesInput,
  ScoreInput,
  SearchFaqInput,
  SearchFaqResult,
  WeighInput
} from './faq-search.types';

import { SEARCH, SEARCH_STOP_WORDS, SEARCH_SYNONYMS } from '../../config';
import { isSameWord, normalize, words } from '../word-match';

const SPLIT = /(\s+)/u;
const EDGE = /[\p{P}\p{S}]/u;
const STOP_WORDS = new Set<string>(SEARCH_STOP_WORDS);

export const queryWords = (query: string) => words(query).filter((word) => !STOP_WORDS.has(word));

export const expandTerms = (query: string) =>
  queryWords(query).map((word) => {
    const group = SEARCH_SYNONYMS.find((synonyms) => synonyms.some((synonym) => isSameWord({ left: word, right: normalize(synonym) })));

    return group ? [word, ...group.map(normalize).filter((synonym) => synonym !== word)] : [word];
  });

const matches = ({ tokens, alternatives }: MatchesInput) =>
  tokens.some((token) => alternatives.some((alternative) => isSameWord({ left: alternative, right: token })));

const weigh = ({ tokens, alternatives, weights }: WeighInput) => {
  const [word, ...synonyms] = alternatives;

  if (tokens.includes(word)) {
    return weights.exact;
  }

  if (matches({ tokens, alternatives: [word] })) {
    return weights.word;
  }

  return matches({ tokens, alternatives: synonyms }) ? weights.synonym : 0;
};

export const scoreEntry = ({ entry, terms }: ScoreInput) => {
  const question = words(entry.question);
  const answer = words(entry.answer);

  const scores = terms.map(
    (alternatives) =>
      weigh({ tokens: question, alternatives, weights: SEARCH.weight.question }) +
      weigh({ tokens: answer, alternatives, weights: SEARCH.weight.answer })
  );

  return scores.every((score) => score > 0) ? sumBy(scores, (score) => score) : 0;
};

export const searchFaq = ({ groups, query, topic }: SearchFaqInput): SearchFaqResult => {
  const terms = expandTerms(query);
  const scoped = topic ? groups.filter(({ key }) => key === topic) : groups;

  if (isEmpty(terms)) {
    return { terms, groups: scoped, hits: [], count: sumBy(scoped, ({ items }) => items.length) };
  }

  const scored: FaqHit[] = scoped
    .flatMap(({ key, items }) => items.map((entry) => ({ ...entry, group: key, score: scoreEntry({ entry, terms }) })))
    .filter(({ score }) => score > 0);

  const best = Math.max(0, ...scored.map(({ score }) => score));
  const hits = scored.filter(({ score }) => score >= best * SEARCH.relevance).sort((left, right) => right.score - left.score);

  return { terms, groups: scoped, hits, count: hits.length };
};

const splitEdges = ({ text: part, start }: Omit<HighlightSegment, 'isMatch'>): HighlightSegment[] => {
  const chars = [...part];
  const leadLength = chars.findIndex((char) => !EDGE.test(char));
  const tailStart = chars.length - [...chars].reverse().findIndex((char) => !EDGE.test(char));
  const lead = chars.slice(0, Math.max(leadLength, 0)).join('');
  const core = chars.slice(Math.max(leadLength, 0), tailStart).join('');
  const tail = chars.slice(tailStart).join('');

  return [
    { text: lead, start, isMatch: false },
    { text: core, start: start + lead.length, isMatch: true },
    { text: tail, start: start + lead.length + core.length, isMatch: false }
  ].filter(({ text }) => text !== '');
};

export const highlight = ({ text, terms }: HighlightInput): HighlightSegment[] => {
  const parts = text.split(SPLIT);
  const starts = parts.map((_, index) => parts.slice(0, index).join('').length);

  return parts.flatMap((part, index) => {
    const token = normalize(part);
    const isMatch = token !== '' && terms.some((alternatives) => matches({ tokens: [token], alternatives }));

    return isMatch ? splitEdges({ text: part, start: starts[index] }) : [{ text: part, start: starts[index], isMatch: false }];
  });
};
