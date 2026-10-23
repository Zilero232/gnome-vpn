import { entries } from 'remeda';

import type { GeoFileTarget, GeoFileUrlInput } from './geo-files.types';

import { GEO_FILES } from '../../config';

export const geoFileTarget = (name: string): GeoFileTarget | null => {
  const found = entries(GEO_FILES.names).find(([, file]) => name === file || name === `${file}${GEO_FILES.sidecarSuffix}`);

  return found ? { kind: found[0], isSidecar: name !== found[1] } : null;
};

export const geoFileUrl = ({ apiUrl, kind }: GeoFileUrlInput): string => new URL(`/${GEO_FILES.route}/${GEO_FILES.names[kind]}`, apiUrl).toString();
