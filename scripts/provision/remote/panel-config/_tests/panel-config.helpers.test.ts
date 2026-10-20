import { describe, expect, it } from 'vitest';

import { CORE_SETTING } from '../panel-config.constants';
import { assertPanelAccepted, readTokenProbe, settingsKeepingCore } from '../panel-config.helpers';

describe('settingsKeepingCore', () => {
  it('keeps every setting the panel had and turns the restart off', () => {
    const raw = JSON.stringify({ success: true, obj: { webPort: 2053, [CORE_SETTING.restartOnClientDisable]: true } });

    expect(JSON.parse(settingsKeepingCore(raw) ?? '')).toEqual({ webPort: 2053, [CORE_SETTING.restartOnClientDisable]: false });
  });

  it('answers null when the restart is already off, so nothing is written back', () => {
    const raw = JSON.stringify({ success: true, obj: { webPort: 2053, [CORE_SETTING.restartOnClientDisable]: false } });

    expect(settingsKeepingCore(raw)).toBeNull();
  });

  it('refuses an empty answer rather than writing one setting over all of them', () => {
    expect(() => settingsKeepingCore('')).toThrow();
  });

  it('refuses an answer that is not json', () => {
    expect(() => settingsKeepingCore('<html>login</html>')).toThrow();
  });

  it('refuses a failed read', () => {
    expect(() => settingsKeepingCore(JSON.stringify({ success: false, msg: 'unauthorized', obj: {} }))).toThrow('unauthorized');
  });

  it('refuses an empty settings object', () => {
    expect(() => settingsKeepingCore(JSON.stringify({ success: true, obj: {} }))).toThrow();
  });
});

describe('assertPanelAccepted', () => {
  it('passes a successful save', () => {
    expect(() => assertPanelAccepted(JSON.stringify({ success: true, msg: 'saved' }))).not.toThrow();
  });

  it('reports the reason a save was refused, which an http 200 alone would have hidden', () => {
    expect(() => assertPanelAccepted(JSON.stringify({ success: false, msg: 'bad port' }))).toThrow('bad port');
  });
});

describe('readTokenProbe', () => {
  const listed = JSON.stringify({ success: true, obj: [] });

  it('keeps a token the panel answered with its inbounds', () => {
    expect(readTokenProbe(`${listed}\n200`)).toBe('accepted');
  });

  it('rotates only on the 401 the panel gives an unknown bearer token', () => {
    expect(readTokenProbe('\n401')).toBe('rejected');
  });

  it('refuses to decide on a server error, which says nothing about the token', () => {
    expect(() => readTokenProbe('\n502')).toThrow('502');
  });

  it('refuses to decide on a wrong base path, which the panel answers with 404', () => {
    expect(() => readTokenProbe('404 page not found\n404')).toThrow('404');
  });

  it('refuses to decide on no status at all', () => {
    expect(() => readTokenProbe('')).toThrow();
  });

  it('refuses a 200 that is not the panel reply', () => {
    expect(() => readTokenProbe('<html>login</html>\n200')).toThrow();
  });

  it('refuses a 200 the panel marked as failed', () => {
    expect(() => readTokenProbe(`${JSON.stringify({ success: false, msg: 'scope' })}\n200`)).toThrow('scope');
  });
});
