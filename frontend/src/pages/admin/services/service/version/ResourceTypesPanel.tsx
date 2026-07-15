import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { ResourceTypeDto, ResourceTypeValueDto, useClients } from 'src/api';
import { Icon } from 'src/components';
import { texts } from 'src/texts';

export interface ResourceTypesPanelProps {
  // True, if the panel is expanded.
  isOpen: boolean;

  // When the panel has been closed.
  onClose: () => void;
}

const ResourceValueRow = ({ name, value }: { name: string; value: ResourceTypeValueDto }) => {
  const { allowedValues, description, required, type } = value;

  return (
    <div className="border-base-300 border-b py-2 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm font-semibold grow-1">{name}</span>

        <span className="badge badge-ghost badge-sm">{type}</span>

        {required && <span className="badge badge-primary badge-sm">{texts.services.resourceTypesRequired}</span>}
      </div>

      {description && <p className="mt-1 text-sm">{description}</p>}

      {allowedValues && allowedValues.length > 0 && (
        <p className="mt-1 text-xs">
          {texts.services.resourceTypesAllowedValues}: <span className="font-mono">{allowedValues.join(', ')}</span>
        </p>
      )}
    </div>
  );
};

const ResourceValueSection = ({ label, values }: { label: string; values: Record<string, ResourceTypeValueDto> }) => {
  const entries = Object.entries(values);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase">{label}</h4>

      {entries.map(([name, value]) => (
        <ResourceValueRow key={name} name={name} value={value} />
      ))}
    </div>
  );
};

const ResourceType = ({ resourceType }: { resourceType: ResourceTypeDto }) => {
  const { context, description, metrics, name, parameters } = resourceType;

  const metricEntries = Object.entries(metrics);

  return (
    <div className="collapse-arrow border-base-300 bg-base-100 collapse rounded-lg border">
      <input type="checkbox" />

      <div className="collapse-title font-mono text-sm font-semibold">{name}</div>

      <div className="collapse-content text-sm flex flex-col gap-4">
        <p>{description}</p>

        <ResourceValueSection label={texts.services.resourceTypesParameters} values={parameters} />
        <ResourceValueSection label={texts.services.resourceTypesContext} values={context} />

        {metricEntries.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase">{texts.services.resourceTypesMetrics}</h4>

            {metricEntries.map(([metricName, metric]) => (
              <div key={metricName} className="border-base-300 border-b py-2 last:border-b-0">
                <span className="font-mono text-sm font-semibold">{metricName}</span>

                {metric.description && <p className="mt-1 text-sm">{metric.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ResourceTypesPanel = (props: ResourceTypesPanelProps) => {
  const { isOpen, onClose } = props;
  const clients = useClients();

  const {
    data: loadedResourceTypes,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['resource-types'],
    queryFn: () => clients.workers.getResourceTypes(),
    enabled: isOpen,
  });

  return (
    <aside
      className={classNames(
        'border-base-300 bg-base-100 fixed inset-y-0 right-0 z-[200] flex w-96 max-w-full transform flex-col border-l shadow-xl transition-transform duration-300',
        {
          'translate-x-0': isOpen,
          'translate-x-full': !isOpen,
        },
      )}
    >
      <div className="border-base-300 flex items-center justify-between border-b p-4">
        <h3 className="text-base font-bold">{texts.services.resourceTypes}</h3>

        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
          <Icon icon="close" size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto p-4">
        <p className="text-sm">{texts.services.resourceTypesHint}</p>

        {isLoading && <span className="loading loading-spinner loading-sm" />}

        {isError && (
          <div className="alert alert-error text-sm">
            <span>{texts.services.resourceTypesFailed}</span>
          </div>
        )}

        {loadedResourceTypes && loadedResourceTypes.items.length === 0 && (
          <div className="text-sm">{texts.services.resourceTypesEmpty}</div>
        )}

        {loadedResourceTypes?.items.map((resourceType) => (
          <ResourceType key={resourceType.name} resourceType={resourceType} />
        ))}
      </div>
    </aside>
  );
};
