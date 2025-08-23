import classNames from 'classnames';

export const VersionLabel = ({ version, isDefault }: { version: string; isDefault?: boolean }) => {
  return (
    <div
      className={classNames(`badge badge-neutral badge-sm rounded-full font-normal`, {
        'badge-primary': isDefault,
      })}
    >
      {version}
    </div>
  );
};
