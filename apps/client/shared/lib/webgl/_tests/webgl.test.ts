import { describe, expect, it } from 'vitest';

import type { WebglEnvironment } from '../webgl.types';

import { webglTier } from '../webgl';

const DESKTOP: WebglEnvironment = {
  isReducedMotion: false,
  isSaveData: false,
  effectiveType: '4g',
  deviceMemory: 8,
  cores: 8,
  isCoarse: false,
  isNarrow: false,
  hasWebgl: true
};

describe('webglTier', () => {
  it('gives a capable desktop the full scene', () => {
    expect(webglTier(DESKTOP)).toBe('full');
  });

  it('assumes a capable device when the browser hides its hints', () => {
    expect(webglTier({ ...DESKTOP, deviceMemory: undefined, cores: undefined, effectiveType: undefined })).toBe('full');
  });

  it.each([
    ['reduced motion', { isReducedMotion: true }],
    ['Save-Data', { isSaveData: true }],
    ['a 3g connection', { effectiveType: '3g' }],
    ['no WebGL', { hasWebgl: false }],
    ['2 GB of memory', { deviceMemory: 2 }],
    ['two cores', { cores: 2 }]
  ])('keeps the static poster with %s', (_, override) => {
    expect(webglTier({ ...DESKTOP, ...override })).toBe('off');
  });

  it.each([
    ['4 GB of memory', { deviceMemory: 4 }],
    ['four cores', { cores: 4 }],
    ['a phone-sized touch screen', { isCoarse: true, isNarrow: true }]
  ])('draws the lighter scene on %s', (_, override) => {
    expect(webglTier({ ...DESKTOP, ...override })).toBe('lite');
  });

  it('keeps the full scene on a large touch screen', () => {
    expect(webglTier({ ...DESKTOP, isCoarse: true })).toBe('full');
  });
});
