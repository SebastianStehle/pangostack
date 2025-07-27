import { memo, useMemo, useState } from 'react';

export interface AvatarProps {
  user: { name: string; picture?: string };
}

export const Avatar = memo((props: AvatarProps) => {
  const { user } = props;

  const [usePicture, setUsePicture] = useState(!!user.picture);

  const initials = useMemo(() => {
    let result = '';

    for (const part of user.name.split(' ')) {
      const initial = part[0];

      if (initial.match(/[a-z]/i)) {
        result += initial;
      }

      if (result.length === 2) {
        break;
      }
    }

    return result;
  }, [user.name]);

  return usePicture ? (
    <div className="avatar flex">
      <div className="w-8 rounded-full">
        <img src={user.picture} alt={user.name} onError={() => setUsePicture(false)} />
      </div>
    </div>
  ) : (
    <div className="avatar placeholder flex font-semibold">
      <div className="w-8 rounded-full bg-neutral text-neutral-content">
        <span className="text-xs">{initials}</span>
      </div>
    </div>
  );
});
