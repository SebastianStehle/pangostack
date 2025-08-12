import { flip, Placement, size, useFloating } from '@floating-ui/react-dom';
import classNames from 'classnames';
import { CSSProperties, useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';
import { useEventCallback } from 'src/hooks';
import { ClickOutside } from './ClickOutside';

/* eslint-disable react-hooks/exhaustive-deps */

export class OverlayController {
  private static openController?: OverlayController;
  private listener?: (opened: boolean) => void;

  public isOpen = false;

  public updateOpen(isOpen: boolean) {
    this.isOpen = isOpen;

    if (isOpen) {
      if (OverlayController.openController !== this) {
        OverlayController.openController?.close();
        OverlayController.openController = this;
      }
    }
  }

  public open() {
    this.listener?.(true);
  }

  public close() {
    this.listener?.(false);
  }

  public listen(listener?: (opened: boolean) => void): () => void {
    this.listener = listener;

    return () => {
      this.listener = undefined;
    };
  }
}

export interface OverlayDropdownProps extends React.PropsWithChildren {
  // The placement relative to the button.
  placement?: Placement;

  // The button.
  button: (args: { isOpen: boolean }) => React.ReactNode;

  // The overlay controller.
  controller?: OverlayController;

  // True to open manually.
  openManually?: boolean;

  // The optional class name.
  className?: string;

  // True to use the full width.
  fullWidth?: boolean;

  // True to close manually.
  closeManually?: boolean;
}

export const OverlayDropdown = (props: OverlayDropdownProps) => {
  const { button, children, className, closeManually, controller, fullWidth, openManually, placement } = props;

  const [style, setStyle] = useState<CSSProperties>({});
  const [show, setShow] = useState(false);

  useEffect(() => {
    controller?.updateOpen(show);
  }, [controller, show]);

  const { x, y, strategy, update, refs } = useFloating({
    placement: placement || 'bottom-end',
    middleware: [
      flip(),
      size({
        apply({ availableWidth, availableHeight, rects }) {
          setStyle({
            maxWidth: availableWidth,
            maxHeight: availableHeight,
            width: fullWidth ? `${rects.reference.width}px` : 'auto',
          });
        },
      }),
    ],
    strategy: 'fixed',
  });

  useEffect(() => {
    if (show) {
      const timer = setInterval(() => {
        update();
      }, 100);

      return () => {
        clearInterval(timer);
      };
    }

    return undefined;
  }, [show, update]);

  useEffect(() => {
    update();
  }, [show]);

  useEffect(() => {
    return (
      controller?.listen((value) => {
        if (value) {
          setShow(true);
        } else {
          setShow(false);
        }
      }) || (() => {})
    );
  }, [controller]);

  const doClose = useEventCallback((event: MouseEvent) => {
    if (event.target && !(refs.reference.current as any)?.['contains'](event.target as any)) {
      setTimeout(() => {
        setShow(false);
      });
    }
  });

  const doCloseAuto = useEventCallback(() => {
    if (!closeManually) {
      setShow(false);
    }
  });

  const doOpen = useEventCallback(() => {
    if (!openManually) {
      setShow((x) => !x);
    }
  });

  return (
    <>
      <span
        className={classNames('overlay-target flex flex-row', className, { open: show })}
        ref={refs.setReference}
        onClick={doOpen}
      >
        {button({ isOpen: show })}
      </span>

      {show && (
        <>
          {ReactDOM.createPortal(
            <ClickOutside isActive={true} onClickOutside={doClose}>
              <div
                className="overlay"
                ref={refs.setFloating}
                onClick={doCloseAuto}
                style={{ position: strategy, left: x ?? 0, top: y ?? 0, ...style }}
              >
                {children}
              </div>
            </ClickOutside>,
            document.body,
          )}
        </>
      )}
    </>
  );
};
