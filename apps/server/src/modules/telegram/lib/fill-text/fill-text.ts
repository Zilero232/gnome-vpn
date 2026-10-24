import { mapValues } from 'remeda';

import { fillTokens } from '@/common/lib';

import type { FillTextInput } from './fill-text.types';

import { html } from '../html';

export const fillLabel = ({ text, fill }: FillTextInput): string => fillTokens({ text, fill });

export const fillText = ({ text, fill }: FillTextInput): string => fillTokens({ text, fill: mapValues(fill, (value) => html.escape(value)) });
