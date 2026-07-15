import { Icon, IconType } from './Icon';

export const Empty = ({ text, label, icon }: { text: string; label: string; icon: IconType }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Icon className="-mt-4 mb-4 text-gray-500" size={120} icon={icon} />

      <div className="-mt-6 font-bold">{label}</div>
      <div className="max-w-50 text-center font-normal">{text}</div>
    </div>
  );
};
