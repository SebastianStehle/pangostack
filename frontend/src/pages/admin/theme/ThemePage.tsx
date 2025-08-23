import { AdminHeader, Page, RefreshButton } from 'src/components';
import { useTheme } from 'src/hooks';
import { texts } from 'src/texts';
import { FileUpload } from './FileUpload';
import { ThemeForm } from './ThemeForm';

export const ThemePage = () => {
  const { refetch } = useTheme();

  return (
    <Page>
      <AdminHeader title={texts.theme.headline}>
        <RefreshButton autoSpinner onClick={refetch} />
      </AdminHeader>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title mb-8">{texts.theme.settings}</h2>
          <ThemeForm />
        </div>
      </div>

      <h2 className="mt-8 mb-2 text-2xl">{texts.theme.files}</h2>

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
