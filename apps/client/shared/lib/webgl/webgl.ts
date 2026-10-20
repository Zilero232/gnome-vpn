import type { WebglEnvironment, WebglTier } from './webgl.types';

import { SLOW_CONNECTIONS, WEBGL_LIMITS } from './webgl.constants';

const UNKNOWN_HIGH = 8;

export const webglTier = ({
  isReducedMotion,
  isSaveData,
  effectiveType,
  deviceMemory,
  cores,
  isCoarse,
  isNarrow,
  hasWebgl
}: WebglEnvironment): WebglTier => {
  const memory = deviceMemory ?? UNKNOWN_HIGH;
  const threads = cores ?? UNKNOWN_HIGH;
  const isSlow = SLOW_CONNECTIONS.includes(effectiveType ?? '');

  if (isReducedMotion || isSaveData || isSlow || !hasWebgl || memory <= WEBGL_LIMITS.offMemory || threads <= WEBGL_LIMITS.offCores) {
    return 'off';
  }

  if (memory <= WEBGL_LIMITS.liteMemory || threads <= WEBGL_LIMITS.liteCores || (isCoarse && isNarrow)) {
    return 'lite';
  }

  return 'full';
};
