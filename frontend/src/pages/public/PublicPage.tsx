import { useQuery } from '@tanstack/react-query';
import { Route, Routes } from 'react-router-dom';
import { useClients } from 'src/api';
import { Notifo, ProfileButton, TransientNavigate, TransientNavLink } from 'src/components';
import { useProfile, useTheme } from 'src/hooks';
import { TeamsDropdown } from './TeamsDropdown';
import { TeamPage } from './team/TeamPage';
import { TeamCreatePage } from './team-create/TeamCreatePage';

export const PublicPage = () => {
  const { theme } = useTheme();
  const clients = useClients();
  const profile = useProfile();

  const { data: teams, isFetched } = useQuery({
    queryKey: ['teams'],
    queryFn: () => clients.teams.getTeams(),
  });

  const team = (teams?.items || [])[0];

  if (!isFetched) {
    return null;
  }

  const headerLinks = theme.headerLinks || [];
  const footerLinks = theme.footerLinks || [];
  const footerText = theme.footerText;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-header h-54">
        <div className="container mx-auto max-w-[1000px] px-4">
          <div className="flex max-w-[1000px] justify-between py-4">
            <TransientNavLink to="/" className="btn btn-link text-primary-content! text-2xl no-underline!">
              {theme.name}
            </TransientNavLink>

            <div className="flex flex-row gap-2">
              {headerLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  className="btn text-primary-content! rounded-full border-0 bg-transparent shadow-none transition-colors duration-500 ease-in-out hover:bg-black/20"
                >
                  {link.title}
                </a>
              ))}

              {profile.notifoApiKey && profile.notifoUrl && <Notifo token={profile.notifoApiKey} url={profile.notifoUrl} />}

              <TeamsDropdown teams={teams?.items || []} />

              <ProfileButton menuPlacement="bottom-end" style="avatar" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <Routes>
          <Route path="/teams/create" element={<TeamCreatePage />} />
          <Route path="/teams/:teamId/*" element={<TeamPage />} />

          <Route
            path="*"
            element={team ? <TransientNavigate to={`/teams/${team.id}`} /> : <TransientNavigate to="/teams/create" />}
          />
        </Routes>
      </div>

      {footerText && footerLinks.length > 0 && (
        <div className="mt-30 bg-black">
          <div className="bg-header/50">
            <div className="text-primary-content! container mx-auto flex max-w-[1000px] items-center gap-6 px-4 py-10">
              {footerText && <span className="text-sm opacity-80">{footerText}</span>}

              {footerLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  className="btn bg-opacity-50 text-primary-content! rounded-full border-0 bg-transparent shadow-none transition-colors duration-500 ease-in-out hover:bg-black/20"
                >
                  {link.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
