import type { RefObject } from 'react';

export type SearchBarProps = {
  value: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
};
