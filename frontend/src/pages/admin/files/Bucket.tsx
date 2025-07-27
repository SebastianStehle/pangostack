import classNames from 'classnames';
import { memo } from 'react';
import { BucketDto } from 'src/api';
import { ConfirmDialog, Icon, TransientNavLink } from 'src/components';
import { OverlayDropdown } from 'src/components/Overlay';
import { texts } from 'src/texts';

export interface BucketProps {
  // The bucket to render.
  bucket: BucketDto;

  // Invoked when deleted.
  onDelete: (bucket: BucketDto) => void;

  // Invoked when updating.
  onUpdate: (bucket: BucketDto) => void;
}

export const Bucket = memo((props: BucketProps) => {
  const { bucket, onDelete, onUpdate } = props;

  return (
    <li className="group flex items-center !px-0">
      <TransientNavLink to={`/admin/files/${bucket.id}`} className="text-normal block min-w-0 grow truncate text-ellipsis">
        {bucket.isDefault && <div className="badge badge-primary mr-2 truncate font-normal">{texts.common.default}</div>}

        {bucket.name}
      </TransientNavLink>

      <OverlayDropdown
        className="p-0"
        button={({ isOpen }) => (
          <button
            className={classNames(
              'btn btn-ghost btn-sm invisible rounded-none bg-slate-100 hover:bg-slate-100 group-hover:visible',
              { 'btn-secondary !visible': isOpen },
            )}
          >
            <Icon size={16} icon="more-horizontal" />
          </button>
        )}
      >
        <ul tabIndex={0} className="dropdown-menu">
          <li>
            <a onClick={() => onUpdate(bucket)}>{texts.common.edit}</a>
          </li>
          <li>
            <ConfirmDialog
              title={texts.files.removeBucketConfirmTitle}
              text={texts.files.removeBucketConfirmText}
              onPerform={() => onDelete(bucket)}
            >
              {({ onClick }) => <a onClick={onClick}>{texts.common.remove}</a>}
            </ConfirmDialog>
          </li>
        </ul>
      </OverlayDropdown>
    </li>
  );
});
