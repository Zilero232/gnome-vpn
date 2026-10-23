export const isoOrNull = (date: Date | null | undefined): string | null => date?.toISOString() ?? null;
