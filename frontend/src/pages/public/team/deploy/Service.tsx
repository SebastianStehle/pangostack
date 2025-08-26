import classNames from 'classnames';
import { memo } from 'react';
import Markdown from 'react-markdown';
import { ServicePublicDto } from 'src/api';
import { Icon, Image } from 'src/components';
import { formatMoney } from 'src/lib';
import { texts } from 'src/texts';

export interface ServiceProps {
  // The service to render.
  service: ServicePublicDto;

  // The base URL.
  url: string;

  // Invoked when clicked.
  onClick: (service: ServicePublicDto) => void;
}

export const Service = memo((props: ServiceProps) => {
  const { onClick, service, url } = props;

  let cheapestPrice = Number.MAX_VALUE;
  if (service.pricingModel === 'fixed') {
    for (const price of service.prices) {
      if (price.amount < cheapestPrice) {
        cheapestPrice = price.amount;
      }
    }
  }

  const doClick = () => {
    if (!service.isPreRelease) {
      onClick(service);
    }
  };

  return (
    <div
      className={classNames('card card-border bg-base border-slate-300', {
        'hover:border-primary group cursor-pointer transition-colors duration-500 ease-in-out': !service.isPreRelease,
      })}
      onClick={doClick}
    >
      <div className="card-body">
        <div className="flex items-center gap-8">
          <Image size="80px" baseUrl={url} fileId={`service_${service.id}`} fallback="/logo-square.svg" />

          <div className="flex grow flex-col gap-2">
            <h2 className="card-title">
              {!service.isPreRelease ? (
                <div className="badge badge-primary badge-sm me-1 rounded-full font-normal">{service.version}</div>
              ) : (
                <div className="badge badge-success badge-sm me-1 rounded-full font-normal">{texts.common.soon}</div>
              )}

              {service.name}
            </h2>

            <Markdown>{service.description}</Markdown>
          </div>

          <div className="w-50 text-right">
            {cheapestPrice < Number.MAX_VALUE && (
              <div>
                <div>
                  <span className="text-2xl">{formatMoney(cheapestPrice, service.currency)} *</span>
                </div>
                <div className="pe-3 text-slate-500">{texts.common.perMonth}</div>
              </div>
            )}
          </div>

          <div className="w-6">
            {!service.isPreRelease && (
              <Icon
                className="group-hover:stroke-primary stroke-slate-300 transition-colors duration-500 ease-in-out"
                icon="chevron-right"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
