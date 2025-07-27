import { NavLink } from 'react-router-dom';
import { useLogoutUrl, useProfile } from 'src/hooks';
import { texts } from 'src/texts';
import { Avatar } from './Avatar';
import { OverlayDropdown } from './Overlay';

export const ProfileButton = () => {
  const profile = useProfile();
  const logoutUrl = useLogoutUrl();

  return (
    <OverlayDropdown
      placement="top-start"
      fullWidth
      button={() => (
        <button className="btn btn-ghost h-auto w-full justify-start p-2 hover:bg-slate-200" data-testId="menu user">
          <div className="flex max-w-full items-center gap-2">
            <div className="shrink-0">
              <Avatar user={profile} />
            </div>

            <div className="min-w-0 text-left leading-5">
              <div className="truncate font-semibold">{profile.name}</div>
              <div className="lead truncate font-normal">{profile.email}</div>
            </div>
          </div>
        </button>
      )}
    >
      <ul tabIndex={0} className="dropdown-menu">
        {profile.isAdmin && (
          <li data-testId="link administration">
            <NavLink to="/admin">{texts.common.administration}</NavLink>
          </li>
        )}

        <li>
          <a href={logoutUrl}>{texts.common.logout}</a>
        </li>
      </ul>
    </OverlayDropdown>
  );
};
