import { matchRoutes, useLocation } from 'react-router-dom';
import { TeamDto } from 'src/api';
import { TransientNavLink } from 'src/components';
import { OverlayDropdown } from 'src/components/Overlay';
import { texts } from 'src/texts';

export interface TeamDropdownProps {
  teams: TeamDto[];
}

export const TeamsDropdown = (props: TeamDropdownProps) => {
  const location = useLocation();
  const matches = matchRoutes([{ path: '/teams/:teamId/*' }], location);
  const teamId = +(matches?.[0]?.params?.teamId || '0');
  const { teams } = props;

  const team = teams.find((x) => x.id === teamId);

  if (teams.length === 0) {
    return null;
  }

  return (
    <OverlayDropdown
      placement="bottom-end"
      button={() => (
        <button className="btn btn-primary bg-opacity-50 rounded-full bg-black/20 transition-colors duration-500 ease-in-out hover:bg-black/30">
          {team?.name ?? texts.teams.selectTeam}
        </button>
      )}
    >
      <ul tabIndex={0} className="dropdown-menu mt-1">
        <li>
          {teams.map((team) => (
            <TransientNavLink key={team.id} to={`/teams/${team.id}`}>
              {team.name}
            </TransientNavLink>
          ))}
        </li>
      </ul>
    </OverlayDropdown>
  );
};
