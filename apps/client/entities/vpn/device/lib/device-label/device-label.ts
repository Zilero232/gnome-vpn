import { isNonNullish } from 'remeda';

import type { DeviceLabelInput } from './device-label.types';

import { PLATFORM_LABELS } from '../../config';

export const deviceName = ({ model, app }: DeviceLabelInput): string | null => model ?? app;

export const platformLabel = (platform: string) => {
  const key = platform.toLowerCase().replaceAll(/[\s_-]/gu, '');

  return PLATFORM_LABELS[key] ?? `${platform.charAt(0).toUpperCase()}${platform.slice(1)}`;
};

export const deviceDetails = ({ model, platform, osVersion, app }: DeviceLabelInput): string[] => {
  const system = [platform && platformLabel(platform), osVersion].filter(isNonNullish).join(' ');
  const shownApp = isNonNullish(model) ? app : null;

  return [system, shownApp].filter((detail): detail is string => isNonNullish(detail) && detail.length > 0);
};
