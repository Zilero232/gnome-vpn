# Forms

Part of the [style guide](../README.md).

## 15. Forms — react-hook-form + zodResolver

```tsx
import type { ChangeEmailValues } from '@gnomevpn/schemas';

import { changeEmailSchema } from '@gnomevpn/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const DEFAULT_VALUES: ChangeEmailValues = { newEmail: '' };

const {
  formState: { errors, isDirty },
  handleSubmit,
  register,
  reset
} = useForm<ChangeEmailValues>({
  resolver: zodResolver(changeEmailSchema),
  defaultValues: DEFAULT_VALUES
});
```

- The schema comes from `@gnomevpn/schemas`, never inline in the form.
- `DEFAULT_VALUES` is a module-level constant, not an object literal rebuilt on
  every render.
- A server-side error goes to `onError: toastError` (`useToastError` from
  `@/entities/app/locale`), which maps the `ApiError` code to a localised toast.
  Sign-in and sign-up go through `useAuthFormError` instead, which hands an error
  that belongs to a field to `setError` and toasts the rest; the promo-code form
  puts a refused code on its own field the same way.
- Validation messages are i18n keys (`validation.emailInvalid`), resolved by
  `useFieldError` from `@/entities/app/locale` — the schema never carries
  user-visible prose.
- **Reset with `{ keepFieldsRef: true }`** — `reset(DEFAULT_VALUES, { keepFieldsRef: true })`.
  A plain `reset(values)` empties react-hook-form's field registry and relies on
  every input calling `register` again on the next render; the React Compiler
  memoises `{...register(name)}`, so nothing does. The input keeps its old text,
  never turns dirty and the submit button stays disabled until a reload — every
  form that reset after a success shipped that way once.
- A boolean toggle outside a form uses `useBoolean` from
  `@siberiacancode/reactuse` rather than `useState` — except when the setter is
  passed into an effect or a ref, where its identity changes every render.
