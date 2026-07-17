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
    <tr>
      <td className="font-semibold">{member.user.email}</td>

      <td>{formatDate(member.created)}</td>

      <td>
        <div className="badge badge-info rounded-full">{member.role}</div>
      </td>

      <td className="text-right">
        {onRemove && member.user.id !== profile.id && (
          <ConfirmDialog
            title={texts.members.removeConfirmTitle}
            text={texts.members.removeConfirmText}
            onPerform={() => onRemove(member)}
          >
            {({ onClick }) => (
              <button type="button" className="btn btn-square btn-error btn-sm" onClick={onClick}>
                <Icon size={16} icon="trash" />
              </button>
            )}
          </ConfirmDialog>
        )}
      </td>
    </tr>
  );
};
