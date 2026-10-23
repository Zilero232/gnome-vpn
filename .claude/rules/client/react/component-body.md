---
paths:
  - 'apps/client/**/*.{ts,tsx}'
---

<!-- Compressed editing rules for the web client, loaded automatically on edit. -->
<!-- The full reasoning is docs/guides/client/component-body.md; keep them in sync. -->

# Code style — client: component body

## A component body reads top to bottom

Hooks first, then the values derived from them, then the handlers that act on
those values, then the JSX. Every hook sits above the first `const` that is not
one, so the dependency order is the reading order and nothing is declared after
something that already used it.

```tsx
const t = useTranslations('telegram');
const toastError = useToastError();
const issue = useIssueCode();
const unlink = useUnlinkTelegram();

const [isUnlinkOpen, setIsUnlinkOpen] = useState(false);

const onUnlink = () => { ... };

return ( ... );
```

React already forbids a conditional hook; this keeps them visually grouped too,
so a hook added later cannot drift below a branch by accident.

One shape legitimately sits between hooks and stays where it is:

- **A value a later hook consumes** — when the expression is only an argument,
  inline it into the hook call. When inlining it would be unreadable, leave the
  `const` where it is: the rule orders declarations, it does not ask you to
  hide a dependency.

An effect that needs the latest callback reads it through `useEffectEvent`,
which is a hook like any other and sits in the hook block — never through a ref
assigned during render.
