import { ProfileDto, TeamUserDto } from 'src/api';
import { ConfirmDialog, Icon } from 'src/components';
import { formatDate } from 'src/lib';
import { texts } from 'src/texts';

export interface MemberProps {
  // The member.
  member: TeamUserDto;

  // The current user.
  profile: ProfileDto;

  // Invoked when the member should be removed.
  onRemove?: (member: TeamUserDto) => void;
}

export const Member = (props: MemberProps) => {
  const { onRemove, member, profile } = props;

  return (
    <div className="card card-border bg-base border-slate-300">
      <div className="card-body p-6">
        <div className="flex-column flex items-center gap-8">
          <div className="grow">
            <div className="text-mdx font-semibold">{member.user.email}</div>

            <div className="text-sm leading-6 text-slate-500">
              {texts.common.added} {formatDate(member.created)}
            </div>
          </div>
          <div>
            <div className="badge badge-info rounded-full">{member.role}</div>
          </div>

          <div className="w-10">
            {onRemove && member.user.id !== profile.id && (
              <ConfirmDialog
                title={texts.members.removeConfirmTitle}
                text={texts.members.removeConfirmText}
                onPerform={() => onRemove(member)}
              >
                {({ onClick }) => (
                  <button type="button" className="btn btn-square btn-error" onClick={onClick}>
                    <Icon size={18} icon="trash" />
                  </button>
                )}
              </ConfirmDialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
