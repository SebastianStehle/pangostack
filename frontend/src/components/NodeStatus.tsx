import { texts } from 'src/texts';

export const NodeStatus = ({ isReady, message }: { isReady: boolean; message?: string }) => {
  if (!isReady) {
    return (
      <div className="flex items-center gap-1">
        <span className="inline-flex h-3 w-3 rounded-full bg-red-600"></span> {message || texts.common.notFound}
      </div>
    );
  } else {
    return (
      <div className="flex items-center gap-1">
        <span className="inline-flex h-3 w-3 rounded-full bg-green-600"></span>
      </div>
    );
  }
};
