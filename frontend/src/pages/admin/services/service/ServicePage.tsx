import { Icon, TransientNavLink } from 'src/components';
import { useTypedParams } from 'src/hooks';
import { texts } from 'src/texts';
import { ServiceVersions } from './ServiceVersions';

export const ServicePage = () => {
  const { serviceId } = useTypedParams({ serviceId: 'int' });

  return (
    <>
      <div className="mb-4 flex items-center gap-4">
        <h3 className="grow text-xl">{texts.services.headline}</h3>

        <TransientNavLink className="btn btn-success btn-sm text-sm text-white" to="versions/new">
          <Icon icon="plus" size={16} /> {texts.services.createVersion}
        </TransientNavLink>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <ServiceVersions serviceId={+serviceId!} />
        </div>
      </div>
    </>
  );
};
