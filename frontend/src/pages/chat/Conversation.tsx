import classNames from 'classnames';
import { ChangeEvent, FormEvent, KeyboardEvent, memo, useEffect, useState } from 'react';
import { ConversationDto } from 'src/api';
import { ConfirmDialog, Icon, TransientNavLink } from 'src/components';
import { OverlayDropdown } from 'src/components/Overlay';
import { texts } from 'src/texts';

export interface ConversationProps {
  // The conversation to render.
  conversation: ConversationDto;

  // Invoked when deleted.
  onDelete: (conversation: ConversationDto) => void;

  // Invoked when renamed.
  onRename?: (conversation: ConversationDto, name: string) => void;
}

export const Conversation = memo((props: ConversationProps) => {
  const { conversation, onDelete, onRename } = props;
  const [name, setName] = useState(conversation.name);
  const [naming, setNaming] = useState(false);

  useEffect(() => {
    setName(conversation.name);
  }, [conversation.name]);

  const doCancel = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      doStopRename();
    }
  };

  const doCommit = (event: FormEvent) => {
    if (name && onRename) {
      onRename(conversation, name);
      setNaming(false);
    } else {
      doStopRename();
    }

    event.preventDefault();
  };

  const doStopRename = () => {
    setNaming(false);
    setName(conversation.name);
  };

  const doStartRename = () => {
    setNaming(true);
    setName(conversation.name);
  };

  const doSetText = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  if (naming) {
    return (
      <form className="p-0" onSubmit={doCommit}>
        <div>
          <input
            autoFocus
            className="input input-sm input-bordered h-9 w-full"
            onBlur={doStopRename}
            onChange={doSetText}
            onKeyUp={doCancel}
            value={name || ''}
          />
        </div>
      </form>
    );
  }

  return (
    <li className="group relative h-9 max-w-full" onDoubleClick={doStartRename}>
      <TransientNavLink to={`/chat/${conversation.id}`} className="text-normal">
        <div className="w-full truncate">{conversation.name}</div>
      </TransientNavLink>

      <OverlayDropdown
        className="p-0"
        button={({ isOpen }) => (
          <button
            className={classNames(
              'btn btn-ghost btn-sm invisible absolute bottom-0 right-0 top-0 h-auto !scale-100 rounded-none bg-slate-100 hover:bg-slate-100 group-hover:visible',
              { 'btn-secondary !visible': isOpen },
            )}
          >
            <Icon icon="more-horizontal" />
          </button>
        )}
      >
        <ul tabIndex={0} className="dropdown-menu">
          <li>
            <a onClick={doStartRename}>{texts.common.rename}</a>
          </li>

          <li>
            <ConfirmDialog
              title={texts.chat.removeConversationConfirmTitle}
              text={texts.chat.removeConversationConfirmText}
              onPerform={() => onDelete(conversation)}
            >
              {({ onClick }) => <a onClick={onClick}>{texts.common.remove}</a>}
            </ConfirmDialog>
          </li>
        </ul>
      </OverlayDropdown>
    </li>
  );
});
