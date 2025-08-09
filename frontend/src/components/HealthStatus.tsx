import { DeploymentDtoHealthStatusEnum } from 'src/api';
import { texts } from 'src/texts';

export const HealthStatus = ({ status }: { status?: DeploymentDtoHealthStatusEnum | null }) => {
  if (status === 'Succeeded') {
    return (
      <div className="flex items-center gap-1">
        <span className="inline-flex h-3 w-3 rounded-full bg-green-600"></span> {texts.common.healthy}
      </div>
    );
  } else if (status === 'Failed') {
    return (
      <div className="flex items-center gap-1">
        <span className="inline-flex h-3 w-3 rounded-full bg-red-600"></span> {texts.common.unhealthy}
      </div>
    );
  } else {
    return (
      <div className="flex items-center gap-1">
        <span className="inline-flex h-3 w-3 rounded-full bg-gray-600"></span> {texts.common.uncheckedHealth}
      </div>
    );
  }
};
