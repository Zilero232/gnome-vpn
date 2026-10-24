import { isNullish } from 'remeda';

import { SUBJECT_SEPARATOR } from '@/modules/telegram/config';

import type { AnswerDataInput } from './confirm-copy.types';

export const answerData = ({ prefix, answer, subject }: AnswerDataInput): string =>
  isNullish(subject) ? `${prefix}${answer}` : `${prefix}${answer}${SUBJECT_SEPARATOR}${subject}`;
