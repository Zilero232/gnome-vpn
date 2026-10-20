import type { CountryFlagProps } from './CountryFlag.types';

import { FLAGS } from './CountryFlag.constants';
import { countryFlag } from './CountryFlag.variants';

export const CountryFlag = ({ countryCode, size = 'md', className }: CountryFlagProps) => {
  const flag = FLAGS[countryCode.toLowerCase()];

  return <span aria-hidden className={countryFlag({ size, class: className })} style={flag ? { backgroundImage: `url(${flag})` } : undefined} />;
};
