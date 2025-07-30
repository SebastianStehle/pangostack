import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { useClients } from 'src/api';
import { formatTrue } from 'src/lib';
import { texts } from 'src/texts';

export const ServiceVersions = ({ serviceId }: { serviceId: number }) => {
  const clients = useClients();
  const navigate = useNavigate();

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
          <tr
            className="cursor-pointer hover:bg-slate-50"
            key={serviceVersion.id}
            onClick={() => navigate(`versions/${serviceVersion.id}`)}
          >
            <td className="overflow-hidden font-semibold">
              <div
                className={classNames(`badge badge-neutral badge-sm rounded-full font-normal`, {
                  'badge-primary': serviceVersion.isDefault,
                })}
              >
                {serviceVersion.name}
              </div>
            </td>
            <td
              className={classNames(`overflow-hidden`, {
                'font-semibold': serviceVersion.isDefault,
              })}
            >
              {serviceVersion.numDeployments}
            </td>
            <td
              className={classNames(`overflow-hidden`, {
                'font-semibold': serviceVersion.isDefault,
              })}
            >
              {formatTrue(serviceVersion.isActive)}
            </td>
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
