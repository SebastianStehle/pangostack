import classNames from 'classnames';
import { BucketDto, ExtensionDto, ExtensionSpecDto } from 'src/api';
import { ConfirmDialog, Icon } from 'src/components';
import { OverlayDropdown } from 'src/components/Overlay';
import { texts } from 'src/texts';
import { useListValues } from './hooks';

export interface ExtensionCardProps {
  // The buckets.
  buckets: BucketDto[];

  // The spec.
  spec: ExtensionSpecDto;

  // The configured extension. Can be optional for available extensions.
  extension?: ExtensionDto;

  // Invoked when clicked.
  onClick?: (spec: ExtensionSpecDto, extension: ExtensionDto) => void;

  // Invoked when deleted.
  onDelete?: (extension: ExtensionDto) => void;
}

export function ExtensionCard(props: ExtensionCardProps) {
  const { buckets, extension, onClick, onDelete, spec } = props;

  const listValues = useListValues(spec, buckets, extension);

  return (
    <div className="card cursor-pointer bg-base-100 shadow-sm hover:shadow" onClick={() => onClick && onClick(spec, extension!)}>
      <div className="group card-body relative flex flex-row items-start gap-4 p-6">
        {spec.logo && <img className="mt-2 w-16" src={`data:image/svg+xml;utf8,${encodeURIComponent(spec.logo)}`} />}

        <div className="flex min-w-0 flex-col gap-2">
          <div>
            <h3 className="text-lg font-semibold">{spec.title}</h3>

            <div className="text-sm leading-6 text-slate-600">{spec.description}</div>
          </div>

          <div className="flex flex-wrap gap-1">
            {extension?.enabled === false && <div className="badge badge-error">{texts.common.disabled}</div>}

            {spec.type !== 'other' && (
              <div className="badge truncate bg-gray-200">
                <div className="truncate text-ellipsis">{spec.type}</div>
              </div>
            )}

            {listValues.map((value) => (
              <div key={value} className="badge truncate bg-gray-200">
                <div className="truncate text-ellipsis">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {onDelete && extension && (
          <OverlayDropdown
            className="invisible absolute right-2 top-2 p-0 group-hover:visible"
            button={({ isOpen }) => (
              <button
                className={classNames('btn btn-ghost btn-sm rounded-none bg-slate-100 hover:bg-slate-100', {
                  'btn-secondary': isOpen,
                })}
              >
                <Icon size={16} icon="more-horizontal" />
              </button>
            )}
          >
            <ul tabIndex={0} className="dropdown-menu">
              <li>
                <ConfirmDialog
                  title={texts.extensions.removeExtensionConfirmTitle}
                  text={texts.extensions.removeExtensionConfirmText}
                  onPerform={() => onDelete(extension)}
                >
                  {({ onClick }) => <a onClick={onClick}>{texts.common.remove}</a>}
                </ConfirmDialog>
              </li>
            </ul>
          </OverlayDropdown>
        )}
      </div>
    </div>
  );
}
