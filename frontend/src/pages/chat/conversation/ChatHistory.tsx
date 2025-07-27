import { useProfile } from 'src/hooks';
import { ChatMessage } from '../state';
import { ChatItem } from './ChatItem';

export interface ChatHistoryProps {
  // The name of the agent.
  agentName: string;

  // The messages.
  messages: ChatMessage[];

  // The conversation ID.
  conversationId: number;

  // Invoked when the message has been completed.
  onComplete: () => void;
}

export function ChatHistory(props: ChatHistoryProps) {
  const { agentName, conversationId, messages, onComplete } = props;
  const profile = useProfile();

  return (
    <div className="mb-4 mt-4 flex flex-col gap-4">
      {messages.map((message, i) => (
        <ChatItem
          key={`${i}_${conversationId}`}
          agentName={agentName}
          conversationId={conversationId}
          isFirst={i === 0}
          isLast={i === messages.length - 1}
          message={message}
          onComplete={onComplete}
          user={profile}
        />
      ))}
    </div>
  );
}
