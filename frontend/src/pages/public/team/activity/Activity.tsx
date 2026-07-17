import { ActivityDto } from 'src/api';
import { Avatar, Icon, TransientNavLink } from 'src/components';
import { formatDateTime } from 'src/lib';
import { texts } from 'src/texts';

export interface ActivityProps {
  // The activity to render.
  activity: ActivityDto;
}

export const Activity = (props: ActivityProps) => {
  const { activity } = props;

  return (
    <tr>
      <td>
        <div className="flex items-center gap-2">
          {activity.createdBy ? (
            <Avatar size="sm" user={{ name: activity.createdBy.name }} />
          ) : (
            <div className="avatar avatar-placeholder flex">
              <div className="bg-neutral text-neutral-content w-8 rounded-full">
                <Icon size={16} icon="activity" />
              </div>
            </div>
          )}

          <span className="truncate">{activity.createdBy?.name || texts.activities.system}</span>
        </div>
      </td>
      <td>{activity.text}</td>
      <td className="whitespace-nowrap text-slate-500">{formatDateTime(activity.createdAt)}</td>
      <td className="text-right">
        {activity.deploymentId && (
          <TransientNavLink
            className="text-primary text-xs font-semibold hover:underline"
            to={`../deployments/${activity.deploymentId}`}
          >
            {texts.activities.viewDeployment}
          </TransientNavLink>
        )}
      </td>
    </tr>
  );
};
