export const optionalCount = (raw: unknown): number | null => (raw === '' || raw === null || raw === undefined ? null : Number(raw));
