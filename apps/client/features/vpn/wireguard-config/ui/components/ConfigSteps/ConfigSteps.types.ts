import type { WireguardConfigFile, WireguardOverview } from '@gnomevpn/schemas';

export type ConfigStepsProps = {
  overview: WireguardOverview;
  onCreated: (file: WireguardConfigFile) => void;
};
