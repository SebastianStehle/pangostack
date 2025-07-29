import classNames from 'classnames';
import { Navigate, Route, Routes } from 'react-router-dom';
import { TransientNavLink } from 'src/components';
import { texts } from 'src/texts';
import { BillingPage } from './billing/BillingPage';
import { DeploymentPage } from './deployment/DeploymentPage';
import { DeploymentsPage } from './deployments/DeploymentsPage';
import { MembersPage } from './members/MembersPage';
import { SettingsPage } from './settings/SettingsPage';

export function TeamPage() {
  return (
    <div className="-mt-22 container mx-auto max-w-[1000px] px-4">
      <ul className="menu menu-horizontal">
        <li>
          <TransientNavLink
            className={({ isActive }) => classNames('text-primary-content text-lg opacity-70', { 'opacity-100': isActive })}
            to="deployments"
          >
            {texts.deployments.title}
          </TransientNavLink>
        </li>
        <li>
          <TransientNavLink
            className={({ isActive }) => classNames('text-primary-content text-lg opacity-70', { 'opacity-100': isActive })}
            to="billing"
          >
            {texts.billing.title}
          </TransientNavLink>
        </li>
        <li>
          <TransientNavLink
            className={({ isActive }) => classNames('text-primary-content text-lg opacity-70', { 'opacity-100': isActive })}
            to="members"
          >
            {texts.teams.members}
          </TransientNavLink>
        </li>
        <li>
          <TransientNavLink
            className={({ isActive }) => classNames('text-primary-content text-lg opacity-70', { 'opacity-100': isActive })}
            to="settings"
          >
            {texts.common.settings}
          </TransientNavLink>
        </li>
      </ul>

      <div className="card rounded-lg bg-white shadow-xl">
        <div className="card-body p-8">
          <Routes>
            <Route path="billing" element={<BillingPage />} />
            <Route path="deployments" element={<DeploymentsPage />} />
            <Route path="deployments/:deploymentId" element={<DeploymentPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="settings" element={<SettingsPage />} />

            <Route path="*" element={<Navigate to="deployments" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
