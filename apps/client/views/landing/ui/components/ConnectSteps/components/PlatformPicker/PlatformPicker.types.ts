import type { PlatformId } from '@gnomevpn/schemas';

import type { IncyPlatform } from '@/entities/app/incy';

export type PlatformPickerProps = {
  platforms: IncyPlatform[];
  value: PlatformId;
  onChange: (value: PlatformId) => void;
};
