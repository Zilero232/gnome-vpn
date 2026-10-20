import type { SetupPick } from '../../../lib';

export type PlatformPickerProps = {
  value: SetupPick;
  onChange: (value: SetupPick) => void;
};
