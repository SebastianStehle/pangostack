import { useMutation } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { ConversationDto, ConversationDtoRatingEnum, useApi } from 'src/api';
import { Icon } from 'src/components';
import { texts } from 'src/texts';

export interface ConversationRatingProps {
  conversation: ConversationDto;
}

export function ConversationRating(props: ConversationRatingProps) {
  const { conversation } = props;

  const api = useApi();
  const [isVisible, setVisible] = useState(true);

  const updating = useMutation({
    mutationFn: (rating: ConversationDtoRatingEnum) => {
      return api.conversations.putConversation(conversation.id, { rating });
    },
    onSuccess: () => {
      setVisible(false);
    },
  });

  useMemo(() => {
    setVisible(!conversation.rating);
  }, [conversation.rating]);

  const scrollIntoView = useCallback((div: HTMLDivElement) => {
    div?.scrollIntoView();
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="text-center">
      <div className="mx-auto my-4 inline-flex items-center gap-2 rounded border-[1px] border-gray-300 p-1 ps-4">
        {texts.chat.rateConversation}
        <button className="btn btn-square btn-ghost" onClick={() => updating.mutate('good')}>
          <Icon size={14} icon="thumb-up" />
        </button>
        <button className="btn btn-square btn-ghost" onClick={() => updating.mutate('bad')}>
          <Icon size={14} icon="thumb-down" />
        </button>
        <button className="btn btn-square btn-ghost" onClick={() => updating.mutate('unrated')}>
          <Icon size={14} icon="close" />
        </button>
      </div>

      <div ref={scrollIntoView}></div>
    </div>
  );
}
