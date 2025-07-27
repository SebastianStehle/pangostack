import classNames from 'classnames';
import { formatDate } from 'date-fns';
import { memo } from 'react';
import { FileDto } from 'src/api';
import { ConfirmDialog, Icon } from 'src/components';
import { OverlayDropdown } from 'src/components/Overlay';
import { formatFileSize } from 'src/lib';
import { texts } from 'src/texts';

export interface FileCardProps {
  // The uploaded file.
  file: FileDto;

  // Invoked when deleted.
  onDelete: (file: FileDto) => void;
}

export const FileCard = memo((props: FileCardProps) => {
  const { file, onDelete } = props;

  return (
    <div className="card h-36 bg-base-100 shadow-sm hover:shadow">
      <div className="group card-body relative p-4 text-sm">
        <div className="flex items-center gap-3 text-xs">
          <span className="badge bg-gray-200">{file.mimeType}</span>
          <span className="text-sm">{formatFileSize(file.fileSize)}</span>
        </div>

        <div className="mt-1 truncate">{file.fileName}</div>
        <span className="text-sm">{formatDate(file.uploadedAt, 'Pp')}</span>

        <OverlayDropdown
          className="invisible absolute right-2 top-2 p-0 group-hover:visible"
          button={({ isOpen }) => (
            <button
              className={classNames('btn btn-ghost btn-sm rounded-none bg-slate-100 hover:bg-slate-100', {
                'btn-secondary !visible': isOpen,
              })}
            >
              <Icon size={16} icon="more-horizontal" />
            </button>
          )}
        >
          <ul tabIndex={0} className="dropdown-menu">
            <li>
              <ConfirmDialog
                title={texts.files.removeBucketConfirmTitle}
                text={texts.files.removeFileConfirmText}
                onPerform={() => onDelete(file)}
              >
                {({ onClick }) => <a onClick={onClick}>{texts.common.remove}</a>}
              </ConfirmDialog>
            </li>
          </ul>
        </OverlayDropdown>
      </div>
    </div>
  );
});
