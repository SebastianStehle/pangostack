import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useClients } from 'src/api';
import { TransientNavLink } from 'src/components';
import { useTypedParams } from 'src/hooks';
import { texts } from 'src/texts';
import { BillingPage } from './billing/BillingPage';
import { DeployPage } from './deploy/DeployPage';
import { DeploymentPage } from './deployment/DeploymentPage';
import { DeploymentsPage } from './deployments/DeploymentsPage';
import { MembersPage } from './members/MembersPage';
import { SettingsPage } from './settings/SettingsPage';

export const TeamPage = () => {
  const { teamId } = useTypedParams({ teamId: 'int' });
  const clients = useClients();

  const { data: loadedTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => clients.teams.getTeams(),
  });

  const team = loadedTeams?.items.find((x) => x.id === teamId);
  if (!team) {
    return null;
  }

  return (
    <div className="container mx-auto -mt-30 max-w-[1000px] px-4">
      <ul className="menu menu-horizontal">
        <li>
          <TransientNavLink
            className={({ isActive }) => classNames('text-primary-content text-lg opacity-70', { 'opacity-100': isActive })}
            to="deployments"
          >
            {texts.deployments.headline}
          </TransientNavLink>
        </li>
        <li>
          <TransientNavLink
            className={({ isActive }) => classNames('text-primary-content text-lg opacity-70', { 'opacity-100': isActive })}
            to="billing"
          >
            {texts.billing.headline}
          </TransientNavLink>
        </li>
        <li>
          <TransientNavLink
            className={({ isActive }) => classNames('text-primary-content text-lg opacity-70', { 'opacity-100': isActive })}
            to="members"
          >
            {texts.members.headline}
          </TransientNavLink>
        </li>
        <li className="hidden">
          <TransientNavLink
            className={({ isActive }) => classNames('text-primary-content text-lg opacity-70', { 'opacity-100': isActive })}
            to="settings"
          >
            {texts.common.settings}
          </TransientNavLink>
        </li>
      </ul>

      <div className="card mb-8 rounded-[20px] border-10 border-black/20 shadow-xl">
        <div className="card-body rounded-[12px] bg-white p-8">
          <Routes>
            <Route path="billing" element={<BillingPage />} />
            <Route path="deployments" element={<DeploymentsPage />} />
            <Route path="deployments/:deploymentId" element={<DeploymentPage />} />
            <Route path="deployments/new" element={<DeployPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="settings" element={<SettingsPage />} />

            <Route path="*" element={<Navigate to="deployments" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};
