import type { WireguardConfigFile, WireguardOverview } from '@gnomevpn/schemas';

import type { WireguardTarget } from '../../../config';

export type ConfigStepsProps = {
  overview: WireguardOverview;
  target: WireguardTarget;
  onCreated: (file: WireguardConfigFile) => void;
};
