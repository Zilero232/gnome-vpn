export const ADMIN_FORMAT = {
  date: { day: 'numeric', month: 'short', year: 'numeric' },
  dateTime: { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  day: { day: 'numeric', month: 'short' },
  amount: { maximumFractionDigits: 2 },
  compact: { notation: 'compact', maximumFractionDigits: 1 },
  percent: { style: 'percent', maximumFractionDigits: 1 }
} as const;
