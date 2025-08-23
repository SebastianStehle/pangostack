import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { useClients } from 'src/api';
import { RefreshButton, VersionLabel } from 'src/components';
import { formatTrue } from 'src/lib';
import { texts } from 'src/texts';

export const ServiceVersions = ({ serviceId }: { serviceId: number }) => {
  const clients = useClients();
  const navigate = useNavigate();

  const {
    data: loadedServiceVersions,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryKey: ['service-versions', serviceId],
    queryFn: () => clients.services.getServiceVersions(serviceId),
  });

  const serviceVersions = loadedServiceVersions?.items || [];

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title">{texts.services.versions}</h2>

          <RefreshButton isLoading={isFetching} onClick={refetch} />
        </div>

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
                  <VersionLabel version={serviceVersion.name} isDefault={serviceVersion.isDefault} />
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
                <td className="text-sm" colSpan={3}>
                  {texts.services.emptyVersions}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
