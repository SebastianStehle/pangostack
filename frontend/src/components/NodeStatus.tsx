import { texts } from 'src/texts';

export interface NodeStatusProps {
  // Indicates if the node is ready.
  isReady: boolean;

  // The message to show when the node is not ready.
  message?: string;
}

export const NodeStatus = (props: NodeStatusProps) => {
  const { isReady, message } = props;

  if (!isReady) {
    return (
      <div className="flex items-center gap-1">
        <span className="bg-error inline-flex h-3 w-3 rounded-full"></span> {message || texts.common.notFound}
      </div>
    );
  } else {
    return (
      <div className="flex items-center gap-1">
        <span className="bg-success inline-flex h-3 w-3 rounded-full"></span>
      </div>
    );
  }
};
