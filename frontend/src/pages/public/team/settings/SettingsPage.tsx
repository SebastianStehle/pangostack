import { texts } from 'src/texts';

export const SettingsPage = () => {
  return (
    <>
      <div className="mb-8 flex h-10 items-center gap-4">
        <h2 className="grow text-xl">{texts.common.settings}</h2>
      </div>
    </>
  );
};
