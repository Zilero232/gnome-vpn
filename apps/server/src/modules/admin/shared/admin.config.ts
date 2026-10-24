import type { Options } from 'csv-stringify/sync';

import { milliseconds } from 'date-fns';

import type { Prisma } from '@/generated';

import { STATUS_NODE_SELECT } from '@/modules/status';

export const ADMIN_ACTION = {
  extend: 'extend',
  cancelAutoRenew: 'cancelAutoRenew',
  removeDevice: 'removeDevice',
  message: 'message',
  verifyEmail: 'verifyEmail',
  rotateLink: 'rotateLink',
  refund: 'refund',
  createCampaign: 'createCampaign',
  stopCampaign: 'stopCampaign',
  setNodeAvailability: 'setNodeAvailability'
} as const;

export const ADMIN_THROTTLE = {
  read: { default: { ttl: milliseconds({ minutes: 1 }), limit: 120 } },
  write: { default: { ttl: milliseconds({ minutes: 1 }), limit: 20 } },
  export: { default: { ttl: milliseconds({ minutes: 1 }), limit: 6 } }
} as const;

export const ADMIN_CSV = {
  extension: '.csv',
  options: {
    bom: true,
    header: true,
    record_delimiter: 'windows',
    quote_record_delimiter: true,
    escape_formulas: true,
    cast: { boolean: String }
  } as const satisfies Options
} as const;

export const ROW_SELECT = {
  payment: {
    id: true,
    yookassaPaymentId: true,
    amount: true,
    status: true,
    kind: true,
    plan: true,
    isAutoCharge: true,
    extraDevices: true,
    discountPercent: true,
    createdAt: true,
    refundRequestedAt: true,
    user: { select: { id: true, email: true } },
    promoCode: { select: { code: true } }
  } as const satisfies Prisma.PaymentSelect,
  gift: {
    id: true,
    code: true,
    plan: true,
    days: true,
    createdAt: true,
    expiresAt: true,
    buyer: { select: { id: true, email: true } },
    redemptions: {
      select: { createdAt: true, user: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'asc' },
      take: 1
    }
  } as const satisfies Prisma.PromoCodeSelect,
  node: {
    ...STATUS_NODE_SELECT,
    id: true,
    country: true,
    city: true,
    isAvailable: true,
    createdAt: true
  } as const satisfies Prisma.NodeSelect
} as const;

export const NEWEST_FIRST = [{ createdAt: 'desc' }, { id: 'desc' }] satisfies { createdAt?: Prisma.SortOrder; id?: Prisma.SortOrder }[];

export const NODE_ORDER = [{ displayOrder: 'asc' }, { createdAt: 'asc' }] satisfies Prisma.NodeOrderByWithRelationInput[];
