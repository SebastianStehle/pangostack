import { PropsWithChildren, useMemo, useState } from 'react';
import { DialogContext, DialogRequest, useEventCallback } from 'src/hooks';
import { texts } from 'src/texts';
import { Modal } from './Modal';

export const DialogProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const [request, setRequest] = useState<DialogRequest>();

  const doClose = useEventCallback(() => {
    setRequest(undefined);
  });

  const doPerfom = useEventCallback(() => {
    request?.onPerform?.();
    doClose();
  });

  const doCancel = useEventCallback(() => {
    request?.onCancel?.();
    doClose();
  });

  const context = useMemo(() => {
    const result: DialogContext = {
      showDialog: (request) => {
        doCancel();

        setRequest(request);
      },
    };

    return result;
  }, [doCancel]);

  return (
    <>
      <DialogContext.Provider value={context}>{children}</DialogContext.Provider>

      {request && (
        <Modal
          asPortal
          onClose={doClose}
          header={request.title}
          footer={
            <div className="flex justify-between">
              <button className="btn btn-ghost" onClick={doCancel}>
                {request.cancelText || texts.common.no}
              </button>

              <button className="btn btn-error" onClick={doPerfom} autoFocus>
                {request.performText || texts.common.yes}
              </button>
            </div>
          }
          size="sm"
        >
          <p>{request.text}</p>
        </Modal>
      )}
    </>
  );
};
