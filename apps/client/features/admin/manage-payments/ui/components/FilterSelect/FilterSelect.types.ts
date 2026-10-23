export type FilterSelectProps<Value extends string> = {
  id: string;
  label: string;
  value: Value;
  options: readonly { value: Value; label: string }[];
  onChange: (value: Value) => void;
};
