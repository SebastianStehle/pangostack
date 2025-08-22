import { Page } from 'src/components';
import { texts } from 'src/texts';

export const DashboardPage = () => {
  return (
    <Page>
      <h2 className="mb-4 text-3xl">{texts.common.dashboard}</h2>
    </Page>
  );
};
