import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { MessageContentDto, MessageDto, MessageDtoRatingEnum, ProfileDto, StreamUIRequestDto } from 'src/api';
import { Alert, Avatar } from 'src/components';
import { useClipboard, useEventCallback } from 'src/hooks';
import { texts } from 'src/texts';
import { ChatMessage } from '../state';
import { ChatItemActions } from './ChatItemActions';
import { ChatItemContent } from './ChatItemContent';
import { ChatItemDebug } from './ChatItemDebug';
import { ChatItemTools } from './ChatItemTools';
import { ChatItemUI } from './ChatItemUI';

export interface ChatItemProps {
  // The name of the agent.
  agentName: string;

  // The chat message.
  message: ChatMessage;

  // Indicates, if this is the first message.
  isFirst?: boolean;

  // Indicates, if this is the last message.
  isLast?: boolean;

  // The conversation ID.
  conversationId: number;

  // The rating.
  rating?: MessageDtoRatingEnum;

  // The current user.
  user: ProfileDto;

  // Invoked when the message has been completed.
  onComplete: () => void;
}

interface State extends Omit<MessageDto, 'tools'> {
  // The tool that are currently running.
  tools: Record<string, 'Started' | 'Completed'>;

  // The total tokens for this request.
  tokenCount?: number;

  // The debug entries.
  debug: string[];

  // The error message.
  error?: string;

  // True, if running.
  running?: boolean;

  // The ui request;
  ui?: StreamUIRequestDto;
}

export const ChatItem = memo((props: ChatItemProps) => {
  const { agentName, conversationId, message, onComplete, isLast, user } = props;
  const clipboard = useClipboard();
  const container = useRef<HTMLDivElement>();
  const complete = useRef(onComplete);

  const [state, setState] = useState<State>(() => {
    if (Array.isArray(message.content)) {
      const { debug, tools: sourceTools, ...other }: MessageDto = message as any;
      const tools: Record<string, 'Started' | 'Completed'> = {};

      for (const tool of sourceTools || []) {
        tools[tool] = 'Completed';
      }

      return { debug: debug || [], tools, ...other };
    }

    return { content: [], debug: [], tools: {}, type: 'ai', id: 0 };
  });

  const doInit = useCallback((div: HTMLDivElement) => {
    container.current = div;
  }, []);

  useEffect(() => {
    if (!Array.isArray(message.content)) {
      setState((s) => ({ ...s, running: true }));

      message.content.subscribe({
        next: (message) => {
          if (message.type === 'chunk') {
            setState((s) => ({ ...s, content: [...s.content, ...message.content] }));
          } else if (message.type === 'tool_start') {
            setState((s) => ({ ...s, tools: { ...s.tools, [message.tool.name]: 'Started' } }));
          } else if (message.type === 'tool_end') {
            setState((s) => ({ ...s, tools: { ...s.tools, [message.tool.name]: 'Completed' } }));
          } else if (message.type === 'debug') {
            setState((s) => ({ ...s, debug: [...s.debug, message.content] }));
          } else if (message.type === 'error') {
            setState((s) => ({ ...s, running: false, error: message.message }));
          } else if (message.type === 'completed') {
            setState((s) => ({ ...s, running: false, tokenCount: message.metadata.tokenCount }));
          } else if (message.type === 'saved') {
            setState((s) => ({ ...s, id: message.messageId }));
          } else if (message.type === 'ui') {
            setState((s) => ({ ...s, ui: message.request }));
          }
        },
        error: (error) => {
          setState((s) => ({ ...s, running: false, error }));
        },
        complete: () => {
          setState((s) => ({ ...s, running: false }));
          complete.current();
        },
      });
    }
  }, [message]);

  const mergedContent = useMemo(() => {
    const merged: MessageContentDto[] = [];

    let lastChunk: MessageContentDto | null = null!;
    for (const chunk of state.content) {
      const clone = { ...chunk };

      if (lastChunk?.type === 'text' && clone.type === 'text') {
        lastChunk.text += clone.text;
      } else {
        merged.push(clone);
        lastChunk = clone;
      }
    }

    return merged;
  }, [state.content]);

  useEffect(() => {
    if (isLast) {
      container?.current?.scrollIntoView();
    }
  }, [isLast, state]);

  const scrollIntoView = () => {
    if (isLast) {
      container?.current?.scrollIntoView();
    }
  };

  const doCopy = useEventCallback(async () => {
    const targt: string[] = [];

    for (const content of mergedContent) {
      if (content.type === 'text') {
        targt.push(content.text);
      }
    }

    if (targt.length > 0) {
      await clipboard(targt.join('\n'));
      toast(texts.common.copied, { type: 'info' });
    }
  });

  const doRate = useEventCallback((rating: MessageDtoRatingEnum) => {
    setState((s) => ({ ...s, rating }));
  });

  return (
    <div className="group flex min-w-[0] items-start gap-6 ps-4" data-testid="chat-item">
      {state.type === 'ai' && (
        <div className="avatar placeholder mt-1">
          <div className="w-8 rounded-full bg-cc fill-black/60">AI</div>
        </div>
      )}

      {state.type === 'human' && <Avatar user={user} />}

      <div className="min-w-0 grow">
        <div className="flex h-6 items-center gap-2">
          {state.type === 'ai' && (
            <>
              <strong>{agentName}</strong>
            </>
          )}

          {state.type === 'human' && (
            <>
              <strong>{texts.chat.sourceHuman}</strong>
            </>
          )}

          {state.running && (
            <>
              <span className="loading loading-spinner loading-xs"></span>
            </>
          )}
        </div>

        <div onLoad={scrollIntoView}>
          {state.error && <Alert text={state.error} className="mt-1" />}

          <ChatItemTools tools={state.tools} />

          {state.ui && <ChatItemUI request={state.ui} />}

          <ChatItemContent content={mergedContent} />
        </div>

        <div>
          <ChatItemDebug debug={state.debug} />

          <ChatItemActions
            canCopy={true}
            canRate={state.type === 'ai'}
            conversationId={conversationId}
            messageId={state.id}
            onCopy={doCopy}
            onRated={doRate}
            rating={state.rating}
            renderAlways={isLast}
            tokenCount={state.tokenCount}
            user={user}
          />
        </div>

        <div ref={doInit}></div>
      </div>
    </div>
  );
});
