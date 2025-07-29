import { useQuery } from '@tanstack/react-query';
import { Route, Routes } from 'react-router-dom';
import { useClients } from 'src/api';
import { ProfileButton, TransientNavigate, TransientNavLink } from 'src/components';
import { useTheme } from 'src/hooks';
import { TeamsDropdown } from './TeamsDropdown';
import { TeamPage } from './team/TeamPage';
import { TeamCreatePage } from './team-create/TeamCreatePage';

export function PublicPage() {
  const { theme } = useTheme();
  const clients = useClients();

  const { data: teams, isFetched } = useQuery({
    queryKey: ['teams'],
    queryFn: () => clients.teams.getTeams(),
  });

  const team = (teams?.items || [])[0];

  if (!isFetched) {
    return null;
  }

  return (
    <div>
      <div className="h-50 bg-header">
        <div className="container mx-auto max-w-[1000px] px-4">
          <div className=" flex max-w-[1000px] justify-between py-4">
            <TransientNavLink to="/" className="btn btn-link no-underline! text-primary-content! text-2xl">
              {theme.name}
            </TransientNavLink>

            <div className="flex flex-row gap-4">
              <TeamsDropdown teams={teams?.items || []} />

              <ProfileButton menuPlacement="bottom-end" style="avatar" />
            </div>
          </div>
        </div>
      </div>

      <Routes>
        <Route path="/teams/create" element={<TeamCreatePage />} />
        <Route path="/teams/:id/*" element={<TeamPage />} />

        <Route
          path="*"
          element={team ? <TransientNavigate to={`/teams/${team.id}`} /> : <TransientNavigate to="/teams/create" />}
        />
      </Routes>
    </div>
  );
}
