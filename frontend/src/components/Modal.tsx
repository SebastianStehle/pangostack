import classNames from 'classnames';
import { PropsWithChildren, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

export interface ModalProps extends PropsWithChildren {
  // The optional footer.
  footer?: ReactNode;

  // The header.
  header?: ReactNode;

  // Invoked when closed.
  onClose?: () => void;

  // The optional size.
  size?: 'sm' | 'md' | 'lg';

  // True to choose a gray background.
  gray?: boolean;

  // True to render the dialog as portal.
  asPortal?: boolean;

  // Indicates if the full height should be used.
  fullHeight?: boolean;

  // The optional class name.
  className?: string;
}

export const Modal = (props: ModalProps) => {
  const { asPortal, children, footer, fullHeight, header, gray, onClose, size } = props;
  const isSmall = size === 'sm';
  const isMedium = size === 'md' || !size;
  const isLarge = size === 'lg';

  const render = () => {
    return (
      <div className="fixed top-0 right-0 bottom-0 left-0 z-100 flex flex-col items-center px-4 py-6">
        <div className="fixed top-0 right-0 bottom-0 left-0 z-40 bg-black/20"></div>
        <div
          className={classNames(
            'z-50 flex min-h-0 flex-col overflow-hidden rounded-xl bg-white shadow-xl',
            { 'w-[900px]': isLarge, 'w-[750px]': isMedium, 'mt-8 w-[450px]': isSmall, 'h-full': fullHeight },
            classNames,
          )}
        >
          {header && (
            <div className="flex shrink-0 items-center justify-between border-b-[1px] border-b-slate-200 p-6 px-8">
              <h2 className="text-xl">{header}</h2>

              <button type="button" className="btn btn-square btn-ghost btn-sm flex flex-col items-center" onClick={onClose}>
                <Icon size={18} icon="close" />
              </button>
            </div>
          )}
          <div className={classNames('relative grow overflow-x-hidden overflow-y-auto px-8 py-8', { 'bg-gray-100': gray })}>
            {children}
          </div>
          {footer && (
            <div className="shrink-0 border-t-[1px] border-t-slate-200 p-6 px-8">
              <h2>{footer}</h2>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!asPortal) {
    return render();
  }

  return createPortal(render(), document.body);
};
