import type { WireguardTarget } from '../../../config';

export type TargetPickerProps = {
  value: WireguardTarget;
  onChange: (value: WireguardTarget) => void;
};
