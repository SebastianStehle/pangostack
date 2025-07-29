import { Route, Routes } from 'react-router-dom';
import { Icon, ProfileButton, TransientNavigate, TransientNavLink } from 'src/components';
import { useTheme } from 'src/hooks';
import { texts } from 'src/texts';
import { DashboardPage } from './dashboard/DashboardPage';
import { ServicesPage } from './services/ServicesPage';
import { ThemePage } from './theme/ThemePage';
import { UserGroupsPage } from './user-groups/UserGroupsPage';
import { UsersPage } from './users/UsersPage';

export function AdminPage() {
  const { theme } = useTheme();

  return (
    <div className="flex h-screen flex-col">
      <div className="navbar bg-primary">
        <div className="flex-1">
          <TransientNavLink to="/" className="btn btn-link no-underline! text-primary-content text-xl">
            {theme.name}
          </TransientNavLink>
        </div>
      </div>
      <div className="sidebar-admin flex min-h-0 grow">
        <div className="shadow-xxl flex w-48 shrink-0 flex-col justify-between bg-white">
          <div>
            <ul className="nav-menu nav-menu-bordered mt-4 gap-1">
              <li>
                <TransientNavLink className="flex items-center gap-2" to="/admin/dashboard">
                  <Icon icon="pie-chart" size={16} /> {texts.common.dashboard}
                </TransientNavLink>
              </li>
              <li>
                <TransientNavLink className="flex items-center gap-2" to="/admin/services">
                  <Icon icon="server" size={16} /> {texts.services.headline}
                </TransientNavLink>
              </li>
              <li>
                <TransientNavLink className="flex items-center gap-2" to="/admin/theme">
                  <Icon icon="droplet" size={16} /> {texts.theme.headline}
                </TransientNavLink>
              </li>
              <li>
                <TransientNavLink className="flex items-center gap-2" to="/admin/users">
                  <Icon icon="user" size={16} /> {texts.users.headline}
                </TransientNavLink>
              </li>
              <li>
                <TransientNavLink className="flex items-center gap-2" to="/admin/user-groups">
                  <Icon icon="users" size={16} /> {texts.userGroups.headline}
                </TransientNavLink>
              </li>
            </ul>
          </div>

          <div className="p-2">
            <ProfileButton menuPlacement="top-start" />
          </div>
        </div>

        <div className="flex min-w-0 grow flex-col items-stretch bg-slate-50">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/services/*" element={<ServicesPage />} />

            <Route path="/theme" element={<ThemePage />} />

            <Route path="/users" element={<UsersPage />} />

            <Route path="/user-groups" element={<UserGroupsPage />} />

            <Route path="*" element={<TransientNavigate to="/admin/dashboard" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
