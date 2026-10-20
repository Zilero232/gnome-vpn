import type { ArcLiftInput, GeoPoint, ScreenPoint, UnitPoint } from './globe.types';

import { fibonacciSphere, latLonToPoint } from '../three';
import { GLOBE } from './globe.constants';
import { LAND_MASK } from './land-mask';

const RADIANS = Math.PI / 180;

const VIEW = latLonToPoint({ ...GLOBE.view, radius: 1 });

export const GLOBE_YAW = Math.atan2(-VIEW.x, VIEW.z);

export const GLOBE_PITCH = GLOBE.view.lat * RADIANS;

let maskBytes: Uint8Array | null = null;

const readMask = () => {
  maskBytes ??= Uint8Array.from(atob(LAND_MASK.bits), (char) => char.charCodeAt(0));

  return maskBytes;
};

export const isLand = ({ lat, lon }: GeoPoint) => {
  const row = Math.min(LAND_MASK.height - 1, Math.max(0, Math.floor((90 - lat) / LAND_MASK.step)));
  const column = Math.min(LAND_MASK.width - 1, Math.max(0, Math.floor(((((lon + 180) % 360) + 360) % 360) / LAND_MASK.step)));
  const index = row * LAND_MASK.width + column;

  return (readMask()[index >> 3] & (1 << (index & 7))) !== 0;
};

export const toGeo = ({ x, y, z }: UnitPoint): GeoPoint => ({
  lat: 90 - Math.acos(Math.max(-1, Math.min(1, y))) / RADIANS,
  lon: Math.atan2(z, -x) / RADIANS - 180
});

export const landDots = (count: number) => fibonacciSphere(count).filter((point) => isLand(toGeo(point)));

export const projectGlobe = ({ lat, lon }: GeoPoint): ScreenPoint => {
  const point = latLonToPoint({ lat, lon, radius: GLOBE.radius });

  const x = point.x * Math.cos(GLOBE_YAW) + point.z * Math.sin(GLOBE_YAW);
  const turned = -point.x * Math.sin(GLOBE_YAW) + point.z * Math.cos(GLOBE_YAW);
  const y = point.y * Math.cos(GLOBE_PITCH) - turned * Math.sin(GLOBE_PITCH);
  const z = point.y * Math.sin(GLOBE_PITCH) + turned * Math.cos(GLOBE_PITCH);
  const scale = 1 / ((GLOBE.distance - z) * Math.tan((GLOBE.fov / 2) * RADIANS));

  return { x: (x * scale + 1) / 2, y: (1 - y * scale) / 2, isFront: z / GLOBE.radius > GLOBE.frontLimit };
};

export const arcLift = ({ from, to }: ArcLiftInput) => {
  const start = latLonToPoint({ ...from, radius: 1 });
  const end = latLonToPoint({ ...to, radius: 1 });
  const angle = Math.acos(Math.max(-1, Math.min(1, start.x * end.x + start.y * end.y + start.z * end.z)));

  return 1 + angle * GLOBE.arcLift;
};
