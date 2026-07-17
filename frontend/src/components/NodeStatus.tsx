import { texts } from 'src/texts';

export const NodeStatus = ({ isReady, message }: { isReady: boolean; message?: string }) => {
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
