import { isNonNullish } from 'remeda';

import type { RelayResult } from '../provision-relay';

import { SUMMARY_COLUMNS } from '../../pipeline';
import { RELAY_REPORT } from './relay-report.constants';

export const formatRelaySummary = (results: RelayResult[]) =>
  results
    .map((result) => {
      const suffix = isNonNullish(result.error) ? ` (${result.error})` : '';
      const ports = result.ports.join(', ');

      return `  ${RELAY_REPORT.label.padEnd(SUMMARY_COLUMNS.country)} ${result.host.padEnd(SUMMARY_COLUMNS.host)} ${result.status} [${ports}]${suffix}`;
    })
    .join('\n');
