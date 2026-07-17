export const DeploymentStepStatus = ({ small, status }: { status: string; small?: boolean }) => {
  if (status === 'Running') {
    return <span className={`loading loading-spinner text-primary ${small ? 'loading-xs' : 'loading-sm'}`}></span>;
  }

  const size = small ? 'h-2 w-2' : 'h-3 w-3';
  if (status === 'Completed') {
    return <span className={`inline-flex ${size} bg-success rounded-full`}></span>;
  } else if (status === 'Failed') {
    return <span className={`inline-flex ${size} bg-error rounded-full`}></span>;
  } else {
    return <span className={`inline-flex ${size} bg-neutral rounded-full`}></span>;
  }
};
