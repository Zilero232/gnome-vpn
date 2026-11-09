import type { NodeConfigIssues } from './nodes-config.types';

export const duplicatesOf = (values: string[]): string[] => [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];

const formatPath = (path: PropertyKey[]): string =>
  path.map((segment, index) => (typeof segment === 'number' ? `[${segment}]` : `${index === 0 ? '' : '.'}${String(segment)}`)).join('');

export const formatIssues = (issues: NodeConfigIssues) => issues.map((issue) => `${formatPath(issue.path)} — ${issue.message}`).join('\n');
