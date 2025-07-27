import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { DeploymentDto, UpsertDeploymentDto, useApi } from 'src/api';
import { CHAT_SUGGESTIONS_SCHEME, ChatSuggestions, FormAlert, Forms, Modal, UserGroupTags } from 'src/components';
import { texts } from 'src/texts';

const SCHEME = Yup.object().shape({
  // Required name.
  name: Yup.string().required().label(texts.common.name),

  // Optional array of chat suggestions.
  chatSuggestions: CHAT_SUGGESTIONS_SCHEME,
});

const RESOLVER = yupResolver<any>(SCHEME);

export interface CreateDeploymentDialogProps {
  // Invoked when cancelled.
  onClose: () => void;

  // Invoked when created.
  onCreate: (deployment: DeploymentDto) => void;
}

export function CreateDeploymentDialog(props: CreateDeploymentDialogProps) {
  const { onCreate, onClose } = props;

  const api = useApi();

  const creating = useMutation({
    mutationFn: (request: UpsertDeploymentDto) => {
      return api.extensions.postDeployment(request);
    },
    onSuccess: (response) => {
      onCreate(response);
      onClose();
    },
  });

  const form = useForm<UpsertDeploymentDto>({ resolver: RESOLVER, defaultValues: { enabled: true } });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((v) => creating.mutate(v))}>
        <Modal
          onClose={onClose}
          header={<div className="flex items-center gap-4">{texts.extensions.createDeployment}</div>}
          footer={
            <fieldset disabled={creating.isPending}>
              <div className="flex flex-row justify-between">
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                  {texts.common.cancel}
                </button>

                <button type="submit" className="btn btn-primary">
                  {texts.common.save}
                </button>
              </div>
            </fieldset>
          }
        >
          <fieldset disabled={creating.isPending}>
            <FormAlert common={texts.extensions.createDeploymentFailed} error={creating.error} />

            <Forms.Text vertical name="name" label={texts.common.name} autoFocus required />

            <Forms.Boolean vertical name="enabled" label={texts.common.enabled} />

            <Forms.Row vertical name="userGroupsIds" label={texts.common.userGroups} hints={texts.extensions.userGroupsHints}>
              <UserGroupTags name="userGroupsIds" />
            </Forms.Row>

            <hr className="my-6" />

            <Forms.Url
              vertical
              name="executorEndpoint"
              label={texts.extensions.executorEndpoint}
              hints={texts.extensions.executorEndpointHints}
            />

            <Forms.Textarea vertical name="executorHeaders" label={texts.extensions.executorHeaders} />

            <hr className="my-6" />

            <Forms.Text vertical name="chatFooter" label={texts.theme.footer} hints={texts.theme.footerHints} />

            <Forms.Row vertical name="chatSuggestions" label={texts.theme.suggestions} hints={texts.theme.suggestionsHints}>
              <ChatSuggestions name="chatSuggestions" />
            </Forms.Row>
          </fieldset>
        </Modal>
      </form>
    </FormProvider>
  );
}
