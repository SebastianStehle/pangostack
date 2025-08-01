import { texts } from 'src/texts';

export const MembersPage = () => {
  return (
    <>
      <div className="mb-8 flex h-10 items-center gap-4">
        <h3 className="grow text-xl">{texts.members.headline}</h3>
      </div>
    </>
  );
};
