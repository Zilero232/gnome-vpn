import type { ReactNode } from 'react';

import { SiteShell } from '@/widgets/site/site-shell';

const MarketingLayout = ({ children }: { children: ReactNode }) => <SiteShell>{children}</SiteShell>;

export default MarketingLayout;
