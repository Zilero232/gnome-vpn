export const SEARCH_SYNONYMS = [
  ['возврат', 'вернуть', 'верните', 'деньги', 'refund', 'money'],
  ['цена', 'стоимость', 'стоит', 'тариф', 'оплата', 'платить', 'рубль', 'price', 'cost', 'plan', 'pay', 'pricing'],
  ['телефон', 'смартфон', 'айфон', 'iphone', 'android', 'ios', 'phone', 'mobile'],
  ['компьютер', 'ноутбук', 'windows', 'mac', 'macos', 'linux', 'computer', 'laptop', 'pc', 'desktop'],
  ['подключение', 'подключить', 'настроить', 'настройка', 'установить', 'установка', 'connect', 'setup', 'install'],
  ['отмена', 'отменить', 'отключить', 'выключить', 'автопродление', 'продление', 'cancel', 'renewal', 'renew', 'auto-renew'],
  ['телевизор', 'тв', 'tv', 'television'],
  ['скорость', 'медленно', 'тормозит', 'speed', 'slow']
] as const;

export const SEARCH_STOP_WORDS = [
  'как',
  'можно',
  'ли',
  'сколько',
  'что',
  'у',
  'вас',
  'а',
  'и',
  'в',
  'на',
  'не',
  'по',
  'с',
  'для',
  'мне',
  'я',
  'это',
  'есть',
  'где',
  'когда',
  'the',
  'a',
  'an',
  'how',
  'can',
  'i',
  'is',
  'do',
  'does',
  'what',
  'to',
  'of',
  'my',
  'you',
  'it',
  'much',
  'many',
  'there'
] as const;

export const SEARCH = {
  stem: { minLength: 5, maxGap: 2, tail: 3 },
  typo: { minLength: 5, maxEdits: 1 },
  weight: {
    question: { exact: 5, word: 4, synonym: 2 },
    answer: { exact: 1.25, word: 1, synonym: 0.5 }
  },
  relevance: 0.4,
  pageSize: 5,
  debounceMs: 250,
  queryParam: 'q',
  topicParam: 'topic',
  focusKey: '/'
} as const;
