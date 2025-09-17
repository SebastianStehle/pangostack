import { useQuery } from '@tanstack/react-query';
import { useClients } from 'src/api';
import { Icon, TransientNavLink } from 'src/components';
import { texts } from 'src/texts';
import { Service } from './Service';

export const DeployServicesPage = () => {
  const clients = useClients();

  const { data: loadedServices } = useQuery({
    queryKey: ['services-public'],
    queryFn: () => clients.services.getServicesPublic(),
  });

  return (
    <div>
      <div className="mb-8 flex h-10 items-center gap-4">
        <TransientNavLink className="btn btn-ghost btn-circle text-sm" to={`../deployments`}>
          <Icon icon="arrow-left" size={16} />
        </TransientNavLink>

        <h2 className="grow text-2xl">{texts.deployments.deployHeadline}</h2>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-mdx">{texts.deployments.selectService}</p>

        <div className="flex flex-col gap-2">
          {(loadedServices?.items || []).map((service) => (
            <Service key={service.id} service={service} url={clients.url} />
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-500">* {texts.common.priceFromHint}</p>
      </div>
    </div>
  );
};
