import { createContext, useContext } from 'react';

export interface DialogRequest {
  // The title.
  title: string;

  // The required body text, shown after title.
  text: string;

  // Optional perform text. A default text is chosen when no text is defined.
  performText?: string;

  // Optional canel text. A default text is chosen when no text is defined.
  cancelText?: string;

  // Called when submitted.
  onPerform: () => void;

  // Called when cancelled.
  onCancel?: () => void;
}

export interface DialogContext {
  showDialog(request: DialogRequest): void;
}

export const DialogContext = createContext<DialogContext>(null!);

export function useDialog() {
  return useContext(DialogContext);
}
