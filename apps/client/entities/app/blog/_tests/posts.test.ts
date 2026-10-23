import { describe, expect, it } from 'vitest';

import type { Locale } from '@/shared/i18n';

import { LOCALES, messages } from '@/shared/i18n';

import type { BlogSlug } from '../config';

import { BLOG_SLUGS, POST_LINKS, POST_RELATED, POST_SECTIONS } from '../config';

type Post = { title: string; excerpt: string; intro: string; sections: Record<string, { title: string; body: string }> };

const TAG = /<([\w-]+)>/gu;

const postsOf = (locale: Locale): Record<BlogSlug, Post> => messages[locale].blog.posts;

const linksIn = (body: string) => [...body.matchAll(TAG)].map(([, tag]) => tag).sort();

describe('POST_RELATED', () => {
  it('points every post at other posts, never at itself or twice', () => {
    for (const slug of BLOG_SLUGS) {
      const related = POST_RELATED[slug];

      expect(related.length).toBeGreaterThan(0);
      expect(related).not.toContain(slug);
      expect(new Set(related).size).toBe(related.length);
    }
  });
});

describe('translations', () => {
  it('gives every post exactly the sections the page renders, in both locales', () => {
    for (const locale of LOCALES) {
      for (const slug of BLOG_SLUGS) {
        const { sections } = postsOf(locale)[slug];

        expect(Object.keys(sections).sort()).toEqual([...POST_SECTIONS[slug]].sort());
      }
    }
  });

  it('links a post only to pages the view knows how to link', () => {
    for (const locale of LOCALES) {
      for (const slug of BLOG_SLUGS) {
        for (const { body } of Object.values(postsOf(locale)[slug].sections)) {
          for (const tag of linksIn(body)) {
            expect(POST_LINKS).toHaveProperty([tag]);
          }
        }
      }
    }
  });

  it('links the same pages in both locales, so a translation does not drop a link', () => {
    const [reference, ...rest] = LOCALES;

    for (const slug of BLOG_SLUGS) {
      for (const section of POST_SECTIONS[slug]) {
        const expected = linksIn(postsOf(reference)[slug].sections[section].body);

        for (const locale of rest) {
          expect(linksIn(postsOf(locale)[slug].sections[section].body)).toEqual(expected);
        }
      }
    }
  });
});
