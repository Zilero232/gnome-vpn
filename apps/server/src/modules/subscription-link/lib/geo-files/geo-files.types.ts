import type { GEO_FILES } from '../../config';

export type GeoKind = keyof typeof GEO_FILES.names;

export type GeoFileTarget = {
  kind: GeoKind;
  isSidecar: boolean;
};

export type GeoFileUrlInput = {
  apiUrl: string;
  kind: GeoKind;
};
