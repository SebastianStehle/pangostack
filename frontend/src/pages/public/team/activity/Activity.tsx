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
    <div className="card card-border bg-base border-slate-300">
      <div className="card-body p-6">
        <div className="flex items-center gap-4">
          {activity.createdBy ? (
            <Avatar size="md" user={{ name: activity.createdBy.name }} />
          ) : (
            <div className="avatar avatar-placeholder flex">
              <div className="bg-neutral text-neutral-content w-10 rounded-full">
                <Icon size={18} icon="activity" />
              </div>
            </div>
          )}

          <div className="grow">
            <div className="text-mdx font-semibold">{activity.text}</div>

            <div className="text-sm leading-6 text-slate-500">
              {activity.createdBy?.name || texts.activities.system} • {formatDateTime(activity.createdAt)}
            </div>
          </div>

          {activity.deploymentId && (
            <TransientNavLink
              className="text-primary inline-flex items-center gap-1 text-sm font-semibold hover:underline"
              to={`../deployments/${activity.deploymentId}`}
            >
              {texts.activities.viewDeployment}
            </TransientNavLink>
          )}
        </div>
      </div>
    </div>
  );
};
