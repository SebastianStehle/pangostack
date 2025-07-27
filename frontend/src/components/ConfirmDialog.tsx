import { ReactNode } from 'react';
import { DialogRequest, useDialog } from 'src/hooks';

export interface ConfirmDialogProps extends DialogRequest {
  children: (props: { onClick: () => void }) => ReactNode;
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  const { children, ...request } = props;
  const dialog = useDialog();

  return children({ onClick: () => dialog.showDialog(request) });
}
