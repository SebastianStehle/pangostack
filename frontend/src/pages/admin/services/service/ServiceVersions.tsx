import { useQuery } from '@tanstack/react-query';
import { useClients } from 'src/api';
import { formatTrue } from 'src/lib';
import { texts } from 'src/texts';

export const ServiceVersions = ({ serviceId }: { serviceId: number }) => {
  const clients = useClients();

  const { data: loadedServiceVersions, isFetched } = useQuery({
    queryKey: ['service-versions', serviceId],
    queryFn: () => clients.services.getServiceVersions(serviceId),
  });

  const serviceVersions = loadedServiceVersions?.items || [];

  return (
    <table className="table table-fixed text-base">
      <thead>
        <tr>
          <th>{texts.common.name}</th>
          <th>{texts.services.numDeployments}</th>
          <th>{texts.services.isActive}</th>
        </tr>
      </thead>
      <tbody>
        {serviceVersions.map((serviceVersion) => (
          <tr className="cursor-pointer hover:bg-slate-50" key={serviceVersion.id}>
            <td className="overflow-hidden font-semibold">{serviceVersion.name}</td>
            <td className="overflow-hidden">{serviceVersion.numDeployments}</td>
            <td className="overflow-hidden font-semibold">{formatTrue(serviceVersion.isActive)}</td>
          </tr>
        ))}

        {serviceVersions.length === 0 && isFetched && (
          <tr>
            <td colSpan={3}>{texts.users.empty}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
