import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import type { Messages } from '../../messages';

import { messages } from '../../messages';
import { clientMessages, isRouteNamespace, keepsKey, routeMessages } from '../client-messages';
import { ROUTE_MESSAGES } from '../client-messages.constants';

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

      const isKept = key ? keepsKey({ namespace, key }) : Object.keys(clientMessages('ru')).includes(namespace);

      expect(isKept || isRouteNamespace(namespace), path).toBe(true);
    }
  });

  it('leaves the long server-rendered texts out of the browser bundle', () => {
    const bundle = clientMessages('ru');

    expect(bundle).not.toHaveProperty('blog');
    expect(bundle).not.toHaveProperty('privacy');
    expect(bundle).not.toHaveProperty('terms.sections');
    expect(bundle).not.toHaveProperty('faq.questions');
    expect(bundle).not.toHaveProperty('landing.meta');
  });

  it('leaves a route-scoped namespace out of the bundle every page carries', () => {
    const bundle = clientMessages('ru');

    for (const namespace of ROUTE_MESSAGES) {
      expect(bundle).not.toHaveProperty(namespace);
    }
  });

  it('adds a route-scoped namespace only where the route asks for it', () => {
    const scoped = routeMessages({ locale: 'ru', namespaces: ROUTE_MESSAGES });

    expect(Object.keys(scoped)).toEqual(expect.arrayContaining([...Object.keys(clientMessages('ru')), ...ROUTE_MESSAGES]));
    expect(scoped).toMatchObject({ account: clientMessages('ru').account });

    for (const namespace of ROUTE_MESSAGES) {
      expect(scoped[namespace]).not.toHaveProperty('meta');
    }
  });

  it('cuts the same keys in every locale', () => {
    expect(JSON.stringify(Object.keys(clientMessages('en')))).toBe(JSON.stringify(Object.keys(clientMessages('ru'))));
  });
});
