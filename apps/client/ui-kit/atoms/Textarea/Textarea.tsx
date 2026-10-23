import { clsx } from 'clsx';

import type { TextareaProps } from './Textarea.types';

import s from './Textarea.module.scss';

export const Textarea = ({ className, rows = 4, ...props }: TextareaProps) => <textarea className={clsx(s.root, className)} rows={rows} {...props} />;
