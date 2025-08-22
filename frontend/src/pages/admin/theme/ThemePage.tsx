import { Page } from 'src/components';
import { texts } from 'src/texts';
import { FileUpload } from './FileUpload';
import { ThemeForm } from './ThemeForm';

export const ThemePage = () => {
  return (
    <Page>
      <h2 className="mb-4 text-3xl">{texts.theme.headline}</h2>

      <h2 className="mb-2 text-xl">{texts.theme.settings}</h2>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <ThemeForm />
        </div>
      </div>

      <h2 className="mt-8 mb-2 text-xl">{texts.theme.files}</h2>

      <div className="card bg-base-100 shadow">
        <div className="card-body flex flex-col gap-16">
          <FileUpload property="logo" hints={texts.theme.logoHints} title={texts.theme.logo} fallback="/logo-square.svg" />

          <FileUpload
            property="loginLogo"
            hints={texts.theme.loginLogoHints}
            title={texts.theme.loginLogo}
            fallback="/logo-wide.svg"
          />

          <FileUpload
            property="loginBackground"
            hints={texts.theme.loginBackgroundHints}
            title={texts.theme.loginBackground}
            fallback="/login-background.svg"
          />
        </div>
      </div>
    </Page>
  );
};
