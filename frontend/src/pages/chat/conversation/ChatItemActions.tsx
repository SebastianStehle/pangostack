import { useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import { memo, useState } from 'react';
import { MessageDtoRatingEnum, ProfileDto, RateMessageDtoRatingEnum, useApi } from 'src/api';
import { Icon } from 'src/components';
import { texts } from 'src/texts';

export interface ChatItemActionsProps {
  // The conversation ID.
  conversationId: number;

  // The total tokens for this request.
  tokenCount?: number;

  // The message ID.
  messageId: number;

  // True if copying is allowed.
  canCopy?: boolean;

  // True if rating is allowed.
  canRate?: boolean;

  // True, to show always.
  renderAlways?: boolean;

  // Indicates if the message has been rated.
  rating?: MessageDtoRatingEnum;

  // The current user.
  user: ProfileDto;

  // True, when the message has been rated.
  onRated: (rating: RateMessageDtoRatingEnum) => void;

  // Trhem when the content should be copied.
  onCopy: () => void;
}

const RATINGS: MessageDtoRatingEnum[] = ['incorrect', 'instructions_not_followed', 'insufficient_style', 'lazy', 'refused'];

export const ChatItemActions = memo((props: ChatItemActionsProps) => {
  const { canCopy, canRate, conversationId, messageId, onCopy, onRated, rating, renderAlways, tokenCount, user } = props;

  const api = useApi();
  const [isRating, setIsRating] = useState(false);

  const updateRating = useMutation({
    mutationFn: async (rating: MessageDtoRatingEnum) => {
      await api.conversations.rateMessage(conversationId, messageId, { rating });

      return rating;
    },
    onSuccess: (response) => {
      onRated(response);
    },
  });

  const doToggle = () => {
    setIsRating((x) => !x);
  };

  const doClose = () => {
    setIsRating(false);
  };

  const doRate = (value: MessageDtoRatingEnum) => {
    updateRating.mutate(value);
  };

  if (messageId === 0) {
    return null;
  }

  return (
    <>
      <div className={classNames({ invisible: !renderAlways }, 'flex h-6 items-center gap-2 group-hover:visible')}>
        {canCopy && (
          <button className={classNames('p-1 text-slate-600 hover:text-black')} onClick={onCopy}>
            <Icon size={14} icon="clipboard" />
          </button>
        )}

        {canRate && (
          <button
            className={classNames('p-1 text-slate-600 hover:text-black', { 'text-black [&>*]:stroke-[2]': rating })}
            onClick={doToggle}
          >
            <Icon size={14} icon="thumb-down" />
          </button>
        )}

        {user.isAdmin && tokenCount && tokenCount > 0 && (
          <div className="ms-2 text-sm text-slate-600">
            {tokenCount} {texts.common.tokens}
          </div>
        )}
      </div>

      {isRating && (
        <div className="relative rounded-lg border-[1px] border-gray-300 p-4">
          <button className="btn btn-ghost btn-sm absolute right-1 top-1 p-2" onClick={doClose}>
            <Icon size={16} icon="close" />
          </button>

          <div className="mb-2 text-sm">{texts.chat.ratingHint}</div>

          <div className="flex flex-wrap gap-2">
            {RATINGS.map((r) => (
              <button
                key={r}
                className={classNames('btn btn-outline btn-sm border-slate-300', { 'bg-gray-200': rating === r })}
                onClick={() => doRate(r)}
              >
                {(texts.chat.rating as any)[r]}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
});
