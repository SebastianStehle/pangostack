import { Icon, IconType } from './Icon';

export const Empty = ({ text, label, icon }: { text: string; label: string; icon: IconType }) => {
  return (
    <div className="flex flex-col items-center">
      <Icon className="-mt-4" size={200} icon={icon} />

      <div className="-mt-6 font-bold">{label}</div>
      <div className="max-w-50 text-center font-normal">{text}</div>
    </div>
  );
};
