import { DeploymentDtoHealthStatusEnum } from 'src/api';
import { texts } from 'src/texts';

export const HealthStatus = ({ status }: { status?: DeploymentDtoHealthStatusEnum | null }) => {
  if (status === 'Succeeded') {
    return (
      <div className="flex items-center gap-1">
        <span className="bg-success inline-flex h-3 w-3 rounded-full"></span> {texts.common.healthy}
      </div>
    );
  } else if (status === 'Failed') {
    return (
      <div className="flex items-center gap-1">
        <span className="bg-error inline-flex h-3 w-3 rounded-full"></span> {texts.common.unhealthy}
      </div>
    );
  } else {
    return (
      <div className="flex items-center gap-1">
        <span className="bg-neutral inline-flex h-3 w-3 rounded-full"></span> {texts.common.uncheckedHealth}
      </div>
    );
  }
};
