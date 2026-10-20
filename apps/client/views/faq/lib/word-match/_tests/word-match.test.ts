import { describe, expect, it } from 'vitest';

import { editDistance, isSameWord, normalize } from '../word-match';

describe('normalize', () => {
  it('lowercases, folds ё into е and drops punctuation and quotes', () => {
    expect(normalize('«Ёлка», ЕЩЁ!')).toBe('елка еще');
  });
});

describe('editDistance', () => {
  it('counts a transposition as one edit', () => {
    expect(editDistance({ left: 'тоернт', right: 'торент' })).toBe(1);
    expect(editDistance({ left: 'торент', right: 'торрент' })).toBe(1);
    expect(editDistance({ left: 'кот', right: 'кот' })).toBe(0);
  });
});

describe('isSameWord', () => {
  it.each([
    ['деньгами', 'деньги'],
    ['устройств', 'устройство'],
    ['вернуть', 'верну'],
    ['торент', 'торренты'],
    ['подключается', 'подключить']
  ])('treats %s and %s as one word', (left, right) => {
    expect(isSameWord({ left, right })).toBe(true);
  });

  it.each([
    ['деньги', 'день'],
    ['возврат', 'вернуть'],
    ['стоит', 'стоимость'],
    ['сервер', 'сервис']
  ])('keeps %s and %s apart', (left, right) => {
    expect(isSameWord({ left, right })).toBe(false);
  });
});
