import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useApi } from 'src/api';
import { useTransientContext, useTransientNavigate } from 'src/hooks';

export function NewPage() {
  const api = useApi();

  const context = useTransientContext();
  const navigate = useTransientNavigate();
  const { mutate } = useMutation({
    mutationFn: () => api.conversations.postConversation({ context }),
    onSuccess: (conversation) => {
      navigate(`/chat/${conversation.id}`);
    },
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  return null;
}
