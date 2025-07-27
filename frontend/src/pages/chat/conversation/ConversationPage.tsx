import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { finalize, tap } from 'rxjs';
import { useApi } from 'src/api';
import { useEventCallback, useTheme } from 'src/hooks';
import { texts } from 'src/texts';
import { useChatStore } from '../state';
import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';
import { Configuration } from './Configuration';
import { ConversationRating } from './ConversationRating';

export interface ConversationPageProps {
  // Invoked when the message has been completed.
  onComplete: () => void;
}

export function ConversationPage(props: ConversationPageProps) {
  const { onComplete } = props;

  const api = useApi();

  const { theme } = useTheme();
  const conversationParam = useParams<'id'>();
  const conversationId = +conversationParam.id!;
  const { conversation, messages, running, addMessage, setConversation, setMessages, setRunning } = useChatStore();

  const { data: loadedMessages } = useQuery({
    queryKey: ['history', conversationId],
    queryFn: () => api.conversations.getMessages(conversationId),
    refetchOnWindowFocus: false,
  });

  const { data: loadedConversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => api.conversations.getConversation(conversationId),
    refetchOnWindowFocus: false,
  });

  const { data: loadedDeployments } = useQuery({
    queryKey: ['enabled-deployments'],
    queryFn: () => api.extensions.getDeployments(true),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (loadedMessages) {
      setMessages(loadedMessages.items);
    }
  }, [loadedMessages, setMessages]);

  useEffect(() => {
    if (loadedConversation) {
      setConversation(loadedConversation);
    }
  }, [loadedConversation, setConversation]);

  const deployments = useMemo(() => {
    return loadedDeployments?.items || [];
  }, [loadedDeployments]);

  const deployment = useMemo(() => {
    return deployments.find((x) => x.id === conversation.deploymentId) || deployments[0];
  }, [conversation.deploymentId, deployments]);

  const agentName = useMemo(() => {
    return deployment?.agentName || theme.agentName || texts.chat.sourceAI;
  }, [deployment?.agentName, theme.agentName]);

  const doSubmit = useEventCallback((input: string) => {
    addMessage({ type: 'human', content: [{ type: 'text', text: input }], id: 0 });

    const content = api.stream.streamPrompt(conversationId, input).pipe(
      tap((event) => {
        setRunning(event.type !== 'completed');
      }),
      finalize(() => {
        setRunning(false);
      }),
    );

    addMessage({ type: 'ai', content });
    return false;
  });

  if (!conversation) {
    return null;
  }

  const isEmpty = messages.length === 0 && !!history;

  return (
    <div className="relative mx-auto flex h-screen flex-col">
      <div className="bg-white p-4">
        <Configuration
          canEditDeployment={isEmpty}
          conversation={conversation}
          deployment={deployment}
          deployments={deployments}
          onConversationChange={setConversation}
        />
      </div>

      <div className="grow overflow-auto px-4">
        <div className="mx-auto max-w-[800px]">
          <ChatHistory agentName={agentName} conversationId={conversationId} messages={messages} onComplete={onComplete} />

          {loadedConversation && messages.length > 10 && <ConversationRating conversation={loadedConversation} />}
        </div>
      </div>
      <div className="mt-2 shrink-0 px-4 pb-4">
        <div className="mx-auto max-w-[800px]">
          <ChatInput
            conversationId={conversationId}
            deployment={deployment}
            isDisabled={running}
            isEmpty={isEmpty}
            onSubmit={doSubmit}
          />
        </div>
      </div>
    </div>
  );
}
