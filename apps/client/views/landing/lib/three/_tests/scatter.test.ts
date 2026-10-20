import { describe, expect, it } from 'vitest';

import { fibonacciSphere, latLonToPoint, scatterOnDisc } from '../scatter';

describe('scatterOnDisc', () => {
  it('is deterministic for a seed, so the server poster and the canvas agree run to run', () => {
    expect(scatterOnDisc({ count: 5, innerRadius: 1, outerRadius: 2, seed: 7 })).toEqual(
      scatterOnDisc({ count: 5, innerRadius: 1, outerRadius: 2, seed: 7 })
    );
  });

  it('keeps every point inside the ring', () => {
    for (const { x, z } of scatterOnDisc({ count: 200, innerRadius: 0.6, outerRadius: 1.8, seed: 3 })) {
      const radius = Math.hypot(x, z);

      expect(radius).toBeGreaterThanOrEqual(0.6);
      expect(radius).toBeLessThanOrEqual(1.8);
    }
  });
});

describe('fibonacciSphere', () => {
  it('puts every point on the unit sphere', () => {
    for (const { x, y, z } of fibonacciSphere(50)) {
      expect(Math.hypot(x, y, z)).toBeCloseTo(1);
    }
  });
});

describe('latLonToPoint', () => {
  it('puts the north pole on top', () => {
    const pole = latLonToPoint({ lat: 90, lon: 0, radius: 2 });

    expect(pole.y).toBeCloseTo(2);
    expect(Math.hypot(pole.x, pole.z)).toBeCloseTo(0);
  });

  it('keeps any point at the given radius', () => {
    const point = latLonToPoint({ lat: 52.37, lon: 4.9, radius: 1.5 });

    expect(Math.hypot(point.x, point.y, point.z)).toBeCloseTo(1.5);
  });
});
