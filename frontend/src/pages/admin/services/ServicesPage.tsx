import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ServiceDto, useClients } from 'src/api';
import { Icon, Page } from 'src/components';
import { useEventCallback, useTransientNavigate } from 'src/hooks';
import { texts } from 'src/texts';
import { Service } from './Service';
import { UpsertServiceDialog } from './UpsertServiceDialog';
import { ServicePage } from './service/ServicePage';
import { NewServicePage } from './service/new-version/NewVersionPage';
import { VersionPage } from './service/version/VersionPage';
import { useServicesStore } from './state';

export const ServicesPage = () => {
  const clients = useClients();
  const navigate = useTransientNavigate();
  const { setService, setServices, services } = useServicesStore();
  const [toCreate, setToCreate] = useState<boolean>();
  const [toUpdate, setToUpdate] = useState<ServiceDto | null>(null);

  const {
    data: loadedServices,
    isFetched,
    refetch,
  } = useQuery({
    queryKey: ['services'],
    queryFn: () => clients.services.getServices(),
  });

  useEffect(() => {
    if (loadedServices) {
      setServices(loadedServices.items);
    }
  }, [loadedServices, setServices]);

  const doCreate = useEventCallback((service: ServiceDto) => {
    setService(service);
    navigate(`/admin/services/${service.id}`);
  });

  const doClose = useEventCallback(() => {
    setToUpdate(null);
    setToCreate(false);
  });

  return (
    <Page
      menu={
        <div className="flex flex-col overflow-y-hidden">
          <div className="mb-4 flex items-center gap-4 p-8">
            <h3 className="grow text-xl">{texts.services.headline}</h3>

            <button
              className="btn btn-square btn-success btn-sm text-sm text-white"
              title={texts.services.create}
              onClick={() => setToCreate(true)}
            >
              <Icon icon="plus" size={16} />
            </button>
          </div>

          <div className="grow overflow-y-auto p-8 pt-4">
            <ul className="nav-menu nav-menu-dotted">
              {services.map((service) => (
                <Service key={service.id} service={service} onUpdate={setToUpdate} />
              ))}
            </ul>

            {services.length === 0 && isFetched && <div className="pt-4 text-sm text-gray-400">{texts.services.empty}</div>}
          </div>
        </div>
      }
    >
      <Routes>
        <Route path=":serviceId" element={<ServicePage />}></Route>
        <Route path=":serviceId/versions/new" element={<NewServicePage onCreate={refetch} />} />
        <Route path=":serviceId/versions/:versionId" element={<VersionPage onUpdate={refetch} />} />
      </Routes>

      {toCreate && <UpsertServiceDialog onClose={doClose} onUpsert={doCreate} />}
      {toUpdate && <UpsertServiceDialog onClose={doClose} onUpsert={setService} target={toUpdate} />}
    </Page>
  );
};
