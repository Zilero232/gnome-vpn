import { describe, expect, it } from 'vitest';

import { GEO_FILES } from '@/modules/subscription-link/config';

import { geoFileTarget, geoFileUrl } from '../geo-files';
import { GEO_KINDS } from '../geo-files.constants';

describe('geoFileTarget', () => {
  it('serves every file and its sidecar', () => {
    for (const kind of GEO_KINDS) {
      expect(geoFileTarget(GEO_FILES.names[kind])).toEqual({ kind, isSidecar: false });
      expect(geoFileTarget(`${GEO_FILES.names[kind]}${GEO_FILES.sidecarSuffix}`)).toEqual({ kind, isSidecar: true });
    }
  });

  it('knows nothing else, so the route cannot be walked', () => {
    for (const name of ['', 'geosite', 'GEOSITE.DAT', 'geosite.dat.sha256sum', '..%2Fgeosite.dat', 'geoip.dat/']) {
      expect(geoFileTarget(name)).toBeNull();
    }
  });
});

describe('geoFileUrl', () => {
  it('points INCY at the public API, at a name the route answers to', () => {
    for (const kind of GEO_KINDS) {
      const url = new URL(geoFileUrl({ apiUrl: 'https://api.example.com', kind }));

      expect(url.origin).toBe('https://api.example.com');
      expect(geoFileTarget(url.pathname.split('/').at(-1) ?? '')).toEqual({ kind, isSidecar: false });
      expect(url.pathname).toBe(`/${GEO_FILES.route}/${GEO_FILES.names[kind]}`);
    }
  });
});
