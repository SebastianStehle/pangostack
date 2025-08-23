import { AdminHeader, Page } from 'src/components';
import { texts } from 'src/texts';

export const DashboardPage = () => {
  return (
    <Page>
      <AdminHeader title={texts.common.dashboard} />
    </Page>
  );
};
