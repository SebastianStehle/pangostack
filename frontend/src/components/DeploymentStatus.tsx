import { ReactNode } from 'react';
import { DeploymentDtoStatusEnum } from 'src/api';
import { texts } from 'src/texts';
import { Spinner } from './Spinner';

export interface DeploymentStatusProps {
  // The status of the deployment or deployment step.
  status: DeploymentDtoStatusEnum;

  // Shows the status label next to the indicator.
  showLabel?: boolean;

  // Renders a smaller indicator.
  small?: boolean;
}

export const DeploymentStatus = (props: DeploymentStatusProps) => {
  const { showLabel = true, small, status } = props;

  const size = small ? 'h-3 w-3 size-3!' : 'h-4 w-4 size-4!';

  const dot = (color: string) => {
    return <span className={`inline-flex ${size} ${color} rounded-full`}></span>;
  };

  const render = (indicator: ReactNode, label: string) => {
    if (!showLabel) {
      return indicator;
    }

    return (
      <div className="flex items-center gap-1">
        {indicator} {label}
      </div>
    );
  };

  if (status === 'Running') {
    return render(<Spinner visible className={size} />, texts.common.installing);
  } else if (status === 'Completed') {
    return render(dot('bg-success'), texts.common.succeeded);
  } else if (status === 'Failed') {
    return render(dot('bg-error'), texts.common.failed);
  } else {
    return render(dot('bg-neutral'), texts.common.pending);
  }
};
