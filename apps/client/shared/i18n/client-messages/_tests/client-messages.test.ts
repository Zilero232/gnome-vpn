import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import type { Messages } from '../../messages';

import { messages } from '../../messages';
import { clientMessages, keepsKey } from '../client-messages';

const CLIENT_ROOT = resolve(import.meta.dirname, '../../../..');
const SKIPPED = new Set(['node_modules', '.next', '_tests', 'public']);
const NAMESPACE = /useTranslations\('([^']+)'\)/gu;

const sourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (SKIPPED.has(entry.name)) {
      return [];
    }

    const path = join(directory, entry.name);

    return entry.isDirectory() ? sourceFiles(path) : /\.tsx?$/u.test(entry.name) ? [path] : [];
  });

const isNamespace = (value: string): value is keyof Messages => value in messages.ru;

const clientNamespaces = () =>
  sourceFiles(CLIENT_ROOT)
    .map((path) => readFileSync(path, 'utf8'))
    .filter((source) => source.startsWith("'use client'"))
    .flatMap((source) => [...source.matchAll(NAMESPACE)].map((match) => match[1]));

describe('clientMessages', () => {
  it('keeps every namespace a client component asks for', () => {
    for (const path of clientNamespaces()) {
      const [namespace, key] = path.split('.');

      if (!isNamespace(namespace)) {
        throw new Error(`Unknown namespace in ${path}`);
      }

      expect(key ? keepsKey({ namespace, key }) : Object.keys(clientMessages('ru')).includes(namespace), path).toBe(true);
    }
  });

  it('leaves the long server-rendered texts out of the browser bundle', () => {
    const bundle = clientMessages('ru');

    expect(bundle).not.toHaveProperty('blog');
    expect(bundle).not.toHaveProperty('privacy');
    expect(bundle).not.toHaveProperty('faq.questions');
    expect(bundle).not.toHaveProperty('landing.meta');
  });

  it('cuts the same keys in every locale', () => {
    expect(JSON.stringify(Object.keys(clientMessages('en')))).toBe(JSON.stringify(Object.keys(clientMessages('ru'))));
  });
});
