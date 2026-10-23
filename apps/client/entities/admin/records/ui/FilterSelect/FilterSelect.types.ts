export type FilterSelectProps<Value extends string> = {
  id: string;
  label: string;
  value: Value | null;
  options: readonly { value: Value; label: string }[];
  anyLabel?: string;
  onChange: (value: Value | null) => void;
};
