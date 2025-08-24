import { AdminHeader, Page } from 'src/components';
import { texts } from 'src/texts';
import { Deployments } from './Deployments';
import { Workers } from './Workers';

export const DashboardPage = () => {
  return (
    <Page>
      <AdminHeader title={texts.common.dashboard} />

      <div className="flex flex-col gap-8">
        <Deployments />

        <Workers />
      </div>
    </Page>
  );
};
