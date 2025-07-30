import { useParams } from 'react-router-dom';
import { Icon } from 'src/components';
import { texts } from 'src/texts';
import { ServiceVersions } from './ServiceVersions';

export const ServicePage = () => {
  const { serviceId } = useParams();

  return (
    <>
      <div className="flex pb-4">
        <h3 className="grow text-xl">{texts.services.headline}</h3>

        <button className="btn btn-success btn-sm text-sm text-white">
          <Icon icon="plus" size={16} /> {texts.services.createVersion}
        </button>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <ServiceVersions serviceId={+serviceId!} />
        </div>
      </div>

      <h3 className="mb-3 mt-10 text-xl">Deployments</h3>
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Card Title</h2>
          <p>A card component has a figure, a body part, and inside body there are title and actions parts</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Buy Now</button>
          </div>
        </div>
      </div>
    </>
  );
};
