import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useApi } from 'src/api';
import { CollapseButton, Icon, ProfileButton } from 'src/components';
import { useProfile, useStoredState, useTransientContext, useTransientNavigate } from 'src/hooks';
import { texts } from 'src/texts';
import { Conversations } from './Conversations';
import { NewPage } from './NewPage';
import { ConversationPage } from './conversation/ConversationPage';
import { Files } from './files/Files';
import { useConversationsStore } from './state';

export function ChatPage() {
  const api = useApi();

  const profile = useProfile();
  const navigate = useTransientNavigate();
  const context = useTransientContext();
  const [sidebarLeft, setSidebarLeft] = useStoredState(true, 'sidebar-left');
  const [sidebarRight, setSidebarRight] = useStoredState(true, 'sidebar-right');

  const creating = useMutation({
    mutationFn: () => api.conversations.postConversation({ context }),
    onSuccess: (conversation) => {
      navigate(`/chat/${conversation.id}`);
    },
  });

  const { setConversations } = useConversationsStore();

  const { data: loadedConversations, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.conversations.getConversations(),
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (loadedConversations) {
      setConversations(loadedConversations.items);
    }
  }, [loadedConversations, setConversations]);

  return (
    <div className="flex h-screen w-full">
      {sidebarLeft && (
        <div className="chat-conversations flex w-64 shrink-0 flex-col overflow-hidden bg-slate-100">
          <div className="p-2">
            <button className="btn btn-ghost w-full justify-start p-2 hover:bg-slate-200" onClick={() => creating.mutate()}>
              <Icon icon="edit" size={14} /> {texts.chat.newChat}
            </button>
          </div>

          <div className="grow overflow-y-auto p-2">
            <Conversations />
          </div>
          <div className="p-2">
            <ProfileButton />
          </div>
        </div>
      )}

      <div className="chat-main relative min-h-0 grow overflow-hidden">
        <Routes>
          <Route path=":id" element={<ConversationPage onComplete={refetch} />} />
          <Route path="" element={<NewPage />} />
        </Routes>

        <CollapseButton
          className="absolute left-2 top-1/2"
          side="left"
          isToggled={!sidebarLeft}
          onClick={() => setSidebarLeft(!sidebarLeft)}
          tooltip={sidebarLeft ? texts.common.sidebarLeftHide : texts.common.sidebarLeftShow}
        />

        {!profile.hideFileUpload && (
          <CollapseButton
            className="absolute right-2 top-1/2"
            side="right"
            isToggled={!sidebarRight}
            onClick={() => setSidebarRight(!sidebarRight)}
            tooltip={sidebarRight ? texts.common.sidebarRightHide : texts.common.sidebarRightShow}
          />
        )}
      </div>

      {!profile.hideFileUpload && sidebarRight && (
        <div className="chat-files flex w-72 shrink-0 flex-col overflow-hidden bg-slate-100">
          <Files />
        </div>
      )}
    </div>
  );
}
