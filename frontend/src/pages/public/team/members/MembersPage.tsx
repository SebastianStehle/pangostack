import { texts } from 'src/texts';

export const MembersPage = () => {
  return (
    <>
      <div className="mb-8 flex h-10 items-center gap-4">
        <h2 className="grow text-2xl">{texts.members.headline}</h2>
      </div>
    </>
  );
};
