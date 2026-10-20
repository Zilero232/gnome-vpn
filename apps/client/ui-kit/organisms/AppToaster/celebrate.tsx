import { toast } from 'sonner';

import { GnomeBadge } from '../../atoms/GnomeBadge';
import { CELEBRATE_CLASS } from './AppToaster.constants';

export const celebrate = (message: string) => toast.success(message, { icon: <GnomeBadge size={24} />, className: CELEBRATE_CLASS });
