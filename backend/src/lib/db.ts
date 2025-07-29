import { ValueTransformer } from 'typeorm';

export const DecimalToNumberTransformer: ValueTransformer = {
  to: (value: number): number => value,
  from: (value: string): number => parseFloat(value),
};
