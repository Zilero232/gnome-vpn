export type SparklineProps = {
  values: number[];
  className?: string;
};

export type SparklinePoint = {
  x: number;
  y: number;
};

export type SparklineGeometry = {
  path: string;
  end: SparklinePoint | null;
};
