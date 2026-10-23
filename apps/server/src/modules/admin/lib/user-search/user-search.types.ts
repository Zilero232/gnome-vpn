export type UserSearch =
  | { kind: 'all' }
  | { kind: 'telegramId'; id: string }
  | { kind: 'text'; text: string }
  | { kind: 'userId'; id: string }
  | { kind: 'username'; username: string };
