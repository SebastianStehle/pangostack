import { DeploymentDtoStatusEnum } from 'src/api';
import { texts } from 'src/texts';

export const DeploymentStatus = ({ status }: { status: DeploymentDtoStatusEnum }) => {
  if (status === 'Pending') {
    return (
      <div className="flex items-center gap-1">
        <span className="inline-flex h-3 w-3 rounded-full bg-gray-600"></span> {texts.common.pending}
      </div>
    );
  } else if (status === 'Running') {
    return (
      <div className="flex items-center gap-1">
        <span className="inline-flex h-3 w-3 rounded-full bg-red-600"></span> {texts.common.installing}
      </div>
    );
  } else if (status === 'Completed') {
    return (
      <div className="flex items-center gap-1">
        <span className="inline-flex h-3 w-3 rounded-full bg-green-600"></span> {texts.common.succeeded}
      </div>
    );
  } else {
    return (
      <div className="flex items-center gap-1">
        <span className="inline-flex h-3 w-3 rounded-full bg-red-600"></span> {texts.common.failed}
      </div>
    );
  }
};
