export const visibleTrend = (values: number[]): number[] | undefined => (values.some((value) => value > 0) ? values : undefined);
