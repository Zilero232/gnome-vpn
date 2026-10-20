import type { GeoPoint } from '../../../../../lib';
import type { GlobeMarker } from '../GlobeCanvas';

import { GLOBE_LABEL_SIDE, GLOBE_ORIGIN, LOCATIONS } from '../../../../../config';
import { projectGlobe } from '../../../../../lib';

const spot = (point: GeoPoint) => {
  const { x, y } = projectGlobe(point);

  return { left: `${x * 100}%`, top: `${y * 100}%` };
};

export const MARKERS: GlobeMarker[] = [
  { key: 'origin', ...GLOBE_ORIGIN, isOrigin: true },
  ...LOCATIONS.map(({ key, lat, lon }) => ({ key, lat, lon, isOrigin: false }))
];

export const MARKER_LABELS = [
  { side: GLOBE_LABEL_SIDE.origin, spot: spot(GLOBE_ORIGIN) },
  ...LOCATIONS.map(({ key, lat, lon }) => ({ side: GLOBE_LABEL_SIDE[key], spot: spot({ lat, lon }) }))
];
