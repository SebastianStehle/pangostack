import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useEventCallback } from 'src/hooks';
import { Icon } from './Icon';

export interface RefreshButtonProps {
  // When the button is pressed.
  onClick: () => void;

  // Indicates if it is loading.
  isLoading?: boolean;

  // Indicates if the loading spinnre should be shown automatically.
  autoSpinner?: boolean;
}

export const RefreshButton = (props: RefreshButtonProps) => {
  const { autoSpinner, isLoading: loading, onClick } = props;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    } else {
      setIsLoading(true);
    }
  }, [loading]);

  const doClick = useEventCallback(() => {
    onClick();
    if (autoSpinner) {
      setIsLoading(true);

      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  });

  return (
    <button className="btn btn-square btn-ghost" onClick={doClick} disabled={isLoading}>
      <Icon className={classNames({ 'animate-spin': isLoading })} size={16} icon="refresh" />
    </button>
  );
};
