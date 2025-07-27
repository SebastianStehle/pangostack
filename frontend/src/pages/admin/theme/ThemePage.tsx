import { Page } from 'src/components';
import { texts } from 'src/texts';
import { LogoUpload } from './LogoUpload';
import { ThemeForm } from './ThemeForm';

export function ThemePage() {
  return (
    <Page>
      <h2 className="mb-4 text-3xl">{texts.theme.headline}</h2>

      <h2 className="mb-2 text-xl">{texts.theme.settings}</h2>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <ThemeForm />
        </div>
      </div>

      <h2 className="mb-2 mt-8 text-xl">{texts.theme.logo}</h2>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <LogoUpload />
        </div>
      </div>
    </Page>
  );
}
