import { useQuery } from '@tanstack/react-query';
import { useClients } from 'src/api';
import { AdminHeader, Icon, TransientNavLink } from 'src/components';
import { useTypedParams } from 'src/hooks';
import { texts } from 'src/texts';
import { Deployments } from './Deployments';
import { ServiceSummary } from './ServiceSummary';
import { ServiceVersions } from './ServiceVersions';

export const ServicePage = () => {
  const { serviceId } = useTypedParams({ serviceId: 'int' });
  const clients = useClients();

  const { data: service, refetch } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => clients.services.getService(serviceId),
  });

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
        <ServiceSummary service={service} onEdit={refetch} />
        <ServiceVersions serviceId={serviceId} />
        <Deployments serviceId={serviceId} />
      </div>
    </>
  );
};
