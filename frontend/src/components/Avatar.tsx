import classNames from 'classnames';
import { memo, useMemo, useState } from 'react';

export interface AvatarProps {
  // The user information.
  user: { name: string; picture?: string };

  // The size of the avatar.
  size?: 'sm' | 'md';
}

export const Avatar = memo((props: AvatarProps) => {
  const { size, user } = props;

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

  const actualSize = size === 'md' ? 'w-10' : 'w-8';

  return usePicture ? (
    <div className="avatar flex">
      <div className={classNames(actualSize, 'rounded-full')}>
        <img src={user.picture} alt={user.name} onError={() => setUsePicture(false)} />
      </div>
    </div>
  ) : (
    <div className="avatar avatar-placeholder flex font-semibold">
      <div className={classNames(actualSize, 'bg-neutral text-neutral-content rounded-full')}>
        <span className="text-xs">{initials}</span>
      </div>
    </div>
  );
});
