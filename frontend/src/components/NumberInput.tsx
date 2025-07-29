import type { ComponentPropsWithoutRef } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';

type NumberInputProps = Pick<ControllerRenderProps, 'onChange'> & Omit<ComponentPropsWithoutRef<'input'>, 'onChange'>;

export const NumberInput = ({ onChange, ...props }: NumberInputProps) => {
  return <input {...props} onChange={(event) => onChange?.(parseFloat(event.target.value))} type="number" inputMode="decimal" />;
};
