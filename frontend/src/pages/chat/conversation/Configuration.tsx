import { useMutation } from '@tanstack/react-query';
import { ChangeEvent, memo } from 'react';
import { ConversationDto, DeploymentDto, UpdateConversationDto, useApi } from 'src/api';
import { useEventCallback } from 'src/hooks';

export interface ConfigurationProps {
  // The conversation itself.
  conversation: ConversationDto;

  // The actual deployment.
  deployment: DeploymentDto;

  // The available deployments.
  deployments: DeploymentDto[];

  // Deployment ID can only edited if the conversation is empty.
  canEditDeployment?: boolean;

  // Invoked when the conversation has been changed.
  onConversationChange: (conversation: ConversationDto) => void;
}

export const Configuration = memo((props: ConfigurationProps) => {
  const { canEditDeployment, conversation, deployment, deployments, onConversationChange } = props;

  const api = useApi();

  const updating = useMutation({
    mutationFn: (request: UpdateConversationDto) => {
      return api.conversations.putConversation(conversation.id, request);
    },
    onSuccess: (result) => {
      onConversationChange(result);
    },
  });

  const doUpdate = useEventCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const deploymentId = +event.target.value;

    updating.mutate({ deploymentId });
  });

  if (deployments.length <= 1) {
    return null;
  }

  if (!canEditDeployment) {
    return (
      <div className="select select-bordered w-56 cursor-default items-center bg-none pr-4">
        <div className="truncate text-ellipsis">{deployment.name}</div>
      </div>
    );
  }

  return (
    <select className="select select-bordered w-56" value={deployment.id} onChange={doUpdate}>
      {deployments.map((deployment) => (
        <option disabled={!canEditDeployment} key={deployment.id} value={deployment.id}>
          {deployment.name}
        </option>
      ))}
    </select>
  );
});
