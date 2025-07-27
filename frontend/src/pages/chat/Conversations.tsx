import { useMutation } from '@tanstack/react-query';
import { addDays, addMonths, format, isSameDay, startOfDay, startOfMonth } from 'date-fns';
import { useMemo } from 'react';
import { toast } from 'react-toastify';
import { ConversationDto, useApi } from 'src/api';
import { useEventCallback } from 'src/hooks';
import { buildError } from 'src/lib';
import { texts } from 'src/texts';
import { Conversation } from './Conversation';
import { useConversationsStore } from './state';

export function Conversations() {
  const api = useApi();

  const { conversations, removeConversation, setConversation } = useConversationsStore();

  const renaming = useMutation({
    mutationFn: (args: { conversation: ConversationDto; name: string }) => {
      return api.conversations.putConversation(args.conversation.id, { name: args.name });
    },
    onSuccess: (conversation) => {
      setConversation(conversation);
    },
    onError: async (error) => {
      toast.error(await buildError(texts.chat.removeConversationFailed, error));
    },
  });

  const deleting = useMutation({
    mutationFn: (conversation: ConversationDto) => {
      return api.conversations.deleteConversation(conversation.id);
    },
    onSuccess: (_, conversation) => {
      removeConversation(conversation.id);
    },
    onError: async (error) => {
      toast.error(await buildError(texts.chat.removeConversationFailed, error));
    },
  });

  const doRename = useEventCallback((conversation: ConversationDto, name: string) => {
    renaming.mutate({ conversation, name });
  });

  const grouped = useMemo(() => {
    if (conversations.length === 0) {
      return [];
    }

    const result: Record<string, ConversationDto[]> = {};

    const now = new Date();
    const withInWeek = startOfDay(addDays(now, -7));
    const withInMonth = startOfDay(addDays(now, -30));
    const withinMonths = startOfMonth(addMonths(now, -3));

    for (const item of conversations) {
      const date = item.createdAt;

      let key = '';
      if (isSameDay(now, date)) {
        key = texts.chat.today;
      } else if (date >= withInWeek) {
        key = texts.chat.thisWeek;
      } else if (date >= withInMonth) {
        key = texts.chat.thisMonth;
      } else if (date >= withinMonths) {
        key = format(date, 'LLLL');
      } else {
        key = format(date, 'yyyy');
      }

      const group = result[key] || [];
      group.push(item);

      result[key] = group;
    }

    return Object.entries(result).map(([date, entries]) => ({ date, entries }));
  }, [conversations]);

  return (
    <div className="flex flex-col gap-8">
      {grouped.map((group) => (
        <div key={group.date}>
          <h4 className="mb-1 px-2 text-sm font-semibold text-gray-400">{group.date}</h4>

          <ul className="menu gap-1 p-0">
            {group.entries.map((conversation) => (
              <Conversation key={conversation.id} conversation={conversation} onDelete={deleting.mutate} onRename={doRename} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
