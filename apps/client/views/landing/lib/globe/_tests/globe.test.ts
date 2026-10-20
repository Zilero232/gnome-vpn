import { describe, expect, it } from 'vitest';

import { arcLift, isLand, landDots, projectGlobe, toGeo } from '../globe';
import { GLOBE } from '../globe.constants';

describe('projectGlobe', () => {
  it('puts the view centre in the middle of the card, facing the viewer', () => {
    const point = projectGlobe(GLOBE.view);

    expect(point.x).toBeCloseTo(0.5);
    expect(point.y).toBeCloseTo(0.5);
    expect(point.isFront).toBe(true);
  });

  it('draws north up and east right', () => {
    const centre = projectGlobe(GLOBE.view);

    expect(projectGlobe({ lat: GLOBE.view.lat + 10, lon: GLOBE.view.lon }).y).toBeLessThan(centre.y);
    expect(projectGlobe({ lat: GLOBE.view.lat, lon: GLOBE.view.lon + 10 }).x).toBeGreaterThan(centre.x);
  });

  it('keeps the whole sphere inside the card with a margin', () => {
    const edges = [0, 90, 180, 270].map((bearing) =>
      projectGlobe({ lat: GLOBE.view.lat - 90 * Math.cos((bearing * Math.PI) / 180), lon: GLOBE.view.lon })
    );

    for (const { x, y } of edges) {
      expect(x).toBeGreaterThan(0.05);
      expect(x).toBeLessThan(0.95);
      expect(y).toBeGreaterThan(0.05);
      expect(y).toBeLessThan(0.95);
    }
  });

  it('hides the far side', () => {
    expect(projectGlobe({ lat: -GLOBE.view.lat, lon: GLOBE.view.lon + 180 }).isFront).toBe(false);
  });
});

describe('isLand', () => {
  it('knows the cities on the map from the sea around them', () => {
    expect(isLand({ lat: 55.75, lon: 37.62 })).toBe(true);
    expect(isLand({ lat: 52.52, lon: 13.4 })).toBe(true);
    expect(isLand({ lat: 45, lon: -35 })).toBe(false);
    expect(isLand({ lat: 0, lon: -150 })).toBe(false);
  });
});

describe('toGeo', () => {
  it('turns a point on the unit sphere back into coordinates', () => {
    const geo = toGeo({ x: 0, y: 1, z: 0 });

    expect(geo.lat).toBeCloseTo(90);
  });
});

describe('landDots', () => {
  it('keeps roughly the land share of the sphere', () => {
    const share = landDots(8000).length / 8000;

    expect(share).toBeGreaterThan(0.25);
    expect(share).toBeLessThan(0.4);
  });
});

describe('arcLift', () => {
  it('lifts a longer arc higher', () => {
    const moscow = { lat: 55.75, lon: 37.62 };

    expect(arcLift({ from: moscow, to: { lat: 52.37, lon: 4.9 } })).toBeGreaterThan(arcLift({ from: moscow, to: { lat: 60.17, lon: 24.94 } }));
  });
});
