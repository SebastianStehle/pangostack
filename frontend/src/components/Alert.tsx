import classNames from 'classnames';
import Markdown from 'react-markdown';
import { Icon } from './Icon';

export interface AlertProps {
  // The text as markdown.
  text: string;

  // The optional class name.
  className?: string;
}

export function Alert(props: AlertProps) {
  const { className, text } = props;

  return (
    <div role="alert" className={classNames('text-md alert alert-error py-2', className)}>
      <Icon icon="alert" />
      <Markdown>{text}</Markdown>
    </div>
  );
}
