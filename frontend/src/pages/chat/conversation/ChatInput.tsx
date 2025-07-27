import { useEffect, useMemo, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { DeploymentDto } from 'src/api';
import { Icon } from 'src/components';
import { useEventCallback, useTheme } from 'src/hooks';
import { texts } from 'src/texts';
import { Suggestions } from './Suggestions';

export interface ChatInputProps {
  // The actual deployment.
  deployment?: DeploymentDto;

  // The conversation ID.
  conversationId: number;

  // True if disabled.
  isDisabled?: boolean;

  // Indicates if the histroy is empty.
  isEmpty?: boolean;

  // Invoked when the user commits the message.
  onSubmit: (input: string) => void;
}

export function ChatInput(props: ChatInputProps) {
  const { conversationId, deployment, isDisabled, isEmpty, onSubmit } = props;

  const textarea = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();
  const [input, setInput] = useState('');

  useEffect(() => {
    textarea.current?.focus();
  }, [conversationId]);

  const footer = useMemo(() => {
    return `${deployment?.chatFooter || ''} ${theme.chatFooter || ''}`.trim();
  }, [deployment, theme]);

  const doSetInput = useEventCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  });

  const doSetText = useEventCallback((text: string) => {
    try {
      onSubmit(text);
    } finally {
      setInput('');
    }
  });

  const doSubmit = useEventCallback((event: React.FormEvent) => {
    if (isDisabled || !input || input.length === 0) {
      return;
    }

    doSetText(input);
    event.preventDefault();
  });

  const doKeyDown = useEventCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey) {
      doSubmit(event);
    }
  });

  return (
    <div className="flex flex-col gap-2">
      {isEmpty && <Suggestions deployment={deployment} onSelect={doSetText} />}

      <form className="relative" onSubmit={doSubmit}>
        <TextareaAutosize
          maxRows={5}
          className="pe-15 textarea textarea-bordered block w-full resize-none p-4"
          value={input}
          onChange={doSetInput}
          onKeyDown={doKeyDown}
          placeholder={texts.chat.placeholder}
          ref={textarea}
        />

        <div className="absolute bottom-0 right-6 flex h-16 items-center">
          <button type="submit" className="btn btn-neutral btn-active btn-sm px-1" disabled={!input || isDisabled}>
            <Icon icon="arrow-up" />
          </button>
        </div>
      </form>

      {footer && <div className="mt-2 text-center text-xs text-slate-400">{footer}</div>}
    </div>
  );
}
