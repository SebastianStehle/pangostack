import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { buildError } from 'src/lib';
import { Icon } from './Icon';
import { Markdown } from './Markdown';

export interface FormAlertProps {
  // The common message.
  common: string;

  // The actual error.
  error?: Error | null;

  // Optional class name
  className?: string;
}

export const FormAlert = (props: FormAlertProps) => {
  const { className, common, error } = props;
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function format() {
      setMessage(await buildError(common, error));
    }

    if (error) {
      format();
    }
  }, [common, error]);

  if (!error || !message) {
    return null;
  }

  return (
    <div className={classNames('alert alert-error mb-4', className)}>
      <Icon icon="alert-circle" /> <Markdown>{message}</Markdown>
    </div>
  );
};
