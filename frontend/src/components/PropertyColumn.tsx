import { PropsWithChildren } from 'react';

export interface PropertyColumnProps extends PropsWithChildren {
  // The label of the property.
  label: string;

  // The value; falls back to the children when omitted.
  value?: string;
}

export const PropertyColumn = (props: PropertyColumnProps) => {
  const { children, label, value } = props;

  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <div className="text-mdx">{value || children}</div>
    </div>
  );
};
