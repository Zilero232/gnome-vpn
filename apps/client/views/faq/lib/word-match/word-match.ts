import { range } from 'remeda';

import type { WordPair } from './word-match.types';

import { SEARCH } from '../../config';

const PUNCTUATION = /[\p{P}\p{S}]+/gu;

export const normalize = (text: string) => text.toLocaleLowerCase().replaceAll('ё', 'е').replace(PUNCTUATION, ' ').replace(/\s+/gu, ' ').trim();

export const words = (text: string) =>
  normalize(text)
    .split(/\s+/u)
    .filter((word) => word.length > 1);

const commonPrefix = ({ left, right }: WordPair) => {
  let length = 0;

  while (length < left.length && length < right.length && left[length] === right[length]) {
    length += 1;
  }

  return length;
};

export const editDistance = ({ left, right }: WordPair) => {
  const rows = range(0, left.length + 1).map((row) => range(0, right.length + 1).map((column) => (row === 0 || column === 0 ? row + column : 0)));

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;

      rows[row][column] = Math.min(rows[row - 1][column] + 1, rows[row][column - 1] + 1, rows[row - 1][column - 1] + cost);

      if (row > 1 && column > 1 && left[row - 1] === right[column - 2] && left[row - 2] === right[column - 1]) {
        rows[row][column] = Math.min(rows[row][column], rows[row - 2][column - 2] + 1);
      }
    }
  }

  return rows[left.length][right.length];
};

const isStem = ({ left, right }: WordPair) => {
  const shorter = Math.min(left.length, right.length);

  return (
    shorter >= SEARCH.stem.minLength &&
    Math.abs(left.length - right.length) <= SEARCH.stem.maxGap &&
    commonPrefix({ left, right }) >= Math.max(SEARCH.stem.minLength, shorter - SEARCH.stem.tail)
  );
};

const isTypo = ({ left: query, right: token }: WordPair) => {
  if (query.length < SEARCH.typo.minLength || token.length < SEARCH.typo.minLength) {
    return false;
  }

  return range(Math.max(SEARCH.typo.minLength, query.length - 1), Math.min(token.length, query.length + 1) + 1).some(
    (length) => token.length - length <= SEARCH.stem.maxGap && editDistance({ left: query, right: token.slice(0, length) }) <= SEARCH.typo.maxEdits
  );
};

export const isSameWord = ({ left, right }: WordPair) =>
  left === right || isStem({ left, right }) || isTypo({ left, right }) || isTypo({ left: right, right: left });
