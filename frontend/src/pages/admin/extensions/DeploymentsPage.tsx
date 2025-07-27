import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { toast } from 'react-toastify';
import { DeploymentDto, useApi } from 'src/api';
import { Icon, Page } from 'src/components';
import { useEventCallback, useTransientNavigate } from 'src/hooks';
import { buildError } from 'src/lib';
import { texts } from 'src/texts';
import { CreateDeploymentDialog } from './CreateDeploymentDialog';
import { Deployment } from './Deployment';
import { EmptyPage } from './EmptyPage';
import { ExtensionsPage } from './ExtensionsPage';
import { UpdateDeploymentDialog } from './UpdateDeploymentDialog';
import { useDeploymentstore } from './state';

export function DeploymentsPage() {
  const api = useApi();

  const navigate = useTransientNavigate();
  const [toCreate, setToCreate] = useState<boolean>();
  const [toUpdate, setToUpdate] = useState<DeploymentDto | null>(null);
  const { deployments, removeDeployment, setDeployment, setDeployments } = useDeploymentstore();

  const { data: loadedDeployments, isFetched } = useQuery({
    queryKey: ['deployments'],
    queryFn: () => api.extensions.getDeployments(),
  });

  useEffect(() => {
    if (loadedDeployments) {
      setDeployments(loadedDeployments.items);
    }
  }, [loadedDeployments, setDeployments]);

  const deleting = useMutation({
    mutationFn: (deployment: DeploymentDto) => {
      return api.extensions.deleteDeployment(deployment.id);
    },
    onSuccess: (_, deployment) => {
      removeDeployment(deployment.id);
      navigate('/admin/extensions/');
    },
    onError: async (error) => {
      toast.error(await buildError(texts.extensions.removeDeploymentFailed, error));
    },
  });

  const doCreate = useEventCallback((deployment: DeploymentDto) => {
    setDeployment(deployment);
    navigate(`/admin/extensions/${deployment.id}`);
  });

  const doClose = useEventCallback(() => {
    setToUpdate(null);
    setToCreate(false);
  });

  return (
    <Page
      menu={
        <div className="flex flex-col overflow-y-hidden">
          <div className="flex p-8 pb-4">
            <h3 className="grow text-xl">{texts.extensions.deployments}</h3>

            <button className="btn btn-square btn-success btn-sm text-sm text-white" onClick={() => setToCreate(true)}>
              <Icon icon="plus" size={16} />
            </button>
          </div>

          <div className="grow overflow-y-auto p-8 pt-4">
            <ul className="nav-menu nav-menu-dotted">
              {deployments.map((deployment) => (
                <Deployment key={deployment.id} deployment={deployment} onDelete={deleting.mutate} onUpdate={setToUpdate} />
              ))}
            </ul>

            {deployments.length === 0 && isFetched && (
              <div className="pt-4 text-sm text-gray-400">{texts.extensions.deploymentsEmpty}</div>
            )}
          </div>
        </div>
      }
    >
      <Routes>
        <Route path=":id" element={<ExtensionsPage />} />
        <Route path="" element={<EmptyPage />} />
      </Routes>

      {toCreate && <CreateDeploymentDialog onClose={doClose} onCreate={doCreate} />}
      {toUpdate && <UpdateDeploymentDialog onClose={doClose} onUpdate={setDeployment} target={toUpdate} />}
    </Page>
  );
}
