import type { REMOVAL_KIND } from '../../config';

export type RemovalKind = (typeof REMOVAL_KIND)[keyof typeof REMOVAL_KIND];
