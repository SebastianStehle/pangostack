import { PropsWithChildren } from 'react';

export const PropertyColumn = ({ label, children, value }: { label: string; value?: string } & PropsWithChildren) => {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <div className="text-mdx">{value || children}</div>
    </div>
  );
};
