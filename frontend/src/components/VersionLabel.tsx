import classNames from 'classnames';

export interface VersionLabelProps {
  // The version to display.
  version: string;

  // Highlights the label as the default version.
  isDefault?: boolean;
}

export const VersionLabel = (props: VersionLabelProps) => {
  const { isDefault, version } = props;

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
