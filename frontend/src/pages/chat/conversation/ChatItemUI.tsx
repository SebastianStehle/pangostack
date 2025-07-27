import { useMutation } from '@tanstack/react-query';
import { memo, useState } from 'react';
import { StreamUIRequestDto, useApi } from 'src/api';
import { Markdown } from 'src/components';
import { texts } from 'src/texts';

export const ChatItemUI = memo(({ request }: { request: StreamUIRequestDto }) => {
  const api = useApi();

  const [uiDone, setDone] = useState(false);
  const [uiText, setUiText] = useState('');

  const updateConfirm = useMutation({
    mutationFn: (result: any) => {
      return api.conversations.confirm(request.id, { result });
    },
    onSuccess: () => {
      setDone(true);
    },
  });

  const doSetInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUiText(event.target.value);
  };

  if (uiDone) {
    return null;
  }

  if (request.type === 'boolean') {
    return (
      <div className="my-1 flex flex-col gap-2 rounded border-[1px] border-gray-200 p-3">
        <div>
          <Markdown>{request.text}</Markdown>
        </div>

        <div className="flex gap-2">
          <button className="btn-secndary btn btn-sm" disabled={uiDone} onClick={() => updateConfirm.mutate(true)}>
            {texts.common.yes}
          </button>
          <button className="btn btn-ghost btn-sm" disabled={uiDone} onClick={() => updateConfirm.mutate(false)}>
            {texts.common.no}
          </button>
        </div>
      </div>
    );
  } else {
    const enabled = !uiDone && !!texts;

    return (
      <div className="my-1 flex flex-col gap-2 rounded border-[1px] border-gray-200 p-3">
        <div>
          <Markdown>{request.text}</Markdown>
        </div>

        <div className="flex gap-2">
          <input type="text" className="input input-sm input-bordered" disabled={uiDone} value={uiText} onChange={doSetInput} />

          <button className="btn-secndary btn btn-sm" disabled={!enabled} onClick={() => updateConfirm.mutate(uiText)}>
            {texts.common.confirm}
          </button>
        </div>
      </div>
    );
  }
});
