import type { RefObject } from 'react';

import type { GlobeMarker } from '../../GlobeCanvas.types';

export type GlobeModelProps = {
  samples: number;
  markers: GlobeMarker[];
  labels: RefObject<(HTMLElement | null)[]>;
};
