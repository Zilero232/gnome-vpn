import { invert, isIncludedIn, isNullish, isTruthy } from 'remeda';

import { HTML } from './text.constants';

const ESCAPES: Record<string, string> = HTML.escapes;

const UNESCAPES: Record<string, string> = invert(HTML.escapes);

const escape = (value: string): string => value.replaceAll(/[&<>"]/g, (char) => ESCAPES[char] ?? char);

export const html = {
  escape,
  strip: (markup: string): string => markup.replaceAll(HTML.tag, '').replaceAll(HTML.entity, (entity) => UNESCAPES[entity] ?? entity),
  bold: (value: string): string => `<b>${escape(value)}</b>`,
  code: (value: string): string => `<code>${escape(value)}</code>`,
  italic: (markup: string): string => `<i>${markup}</i>`,
  quote: (markup: string): string => `<blockquote>${markup}</blockquote>`,
  paragraphs: (parts: (string | null | undefined)[]): string => parts.filter(isTruthy).join(HTML.paragraphBreak)
} as const;

export const isTelegramHtml = (markup: string): boolean => {
  const open: string[] = [];

  for (const [tag, name] of markup.matchAll(HTML.tag)) {
    if (isNullish(name) || !isIncludedIn(name, HTML.tags)) {
      return false;
    }

    if (!tag.startsWith('</')) {
      open.push(name);

      continue;
    }

    if (open.pop() !== name) {
      return false;
    }
  }

  return open.length === 0 && !/[<>]/.test(markup.replaceAll(HTML.tag, ''));
};
