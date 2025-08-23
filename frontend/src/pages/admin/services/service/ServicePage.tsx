import { useQuery } from '@tanstack/react-query';
import { useClients } from 'src/api';
import { AdminHeader, Icon, TransientNavLink } from 'src/components';
import { useTypedParams } from 'src/hooks';
import { texts } from 'src/texts';
import { Deployments } from './Deployments';
import { ServiceVersions } from './ServiceVersions';

export const ServicePage = () => {
  const { serviceId } = useTypedParams({ serviceId: 'int' });
  const clients = useClients();

  const { data: loadedServices } = useQuery({
    queryKey: ['services'],
    queryFn: () => clients.services.getServices(),
  });

  const service = loadedServices?.items.find((x) => x.id === serviceId);

  if (!service) {
    return null;
  }

  return (
    <>
      <AdminHeader title={service.name}>
        <TransientNavLink className="btn btn-success btn-sm text-sm text-white" to="versions/new">
          <Icon icon="plus" size={16} /> {texts.services.createVersion}
        </TransientNavLink>
      </AdminHeader>

      <div className="flex flex-col gap-8">
        <ServiceVersions serviceId={serviceId} />

        <Deployments serviceId={serviceId} />
      </div>
    </>
  );
};
