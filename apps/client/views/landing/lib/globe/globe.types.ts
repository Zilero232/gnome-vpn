export type GeoPoint = {
  lat: number;
  lon: number;
};

export type UnitPoint = {
  x: number;
  y: number;
  z: number;
};

export type ScreenPoint = {
  x: number;
  y: number;
  isFront: boolean;
};

export type ArcLiftInput = {
  from: GeoPoint;
  to: GeoPoint;
};
