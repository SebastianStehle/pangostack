import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamEntity, TeamRepository, TeamUserEntity, TeamUserRepository } from 'src/domain/database';
import { NotificationsService } from 'src/domain/notifications';
import { Team, User } from '../interfaces';
import { buildTeam } from './utils';

export class DeleteTeamUser extends Command<DeleteTeamUserResult> {
  constructor(
    public readonly teamId: number,
    public readonly userId: string,
    public readonly user: User,
  ) {
    super();
  }
}

export class DeleteTeamUserResult {
  constructor(public readonly team: Team) {}
}

@CommandHandler(DeleteTeamUser)
export class DeleteTeamUserHandler implements ICommandHandler<DeleteTeamUser, DeleteTeamUserResult> {
  constructor(
    private readonly notifications: NotificationsService,
    @InjectRepository(TeamEntity)
    private readonly teams: TeamRepository,
    @InjectRepository(TeamUserEntity)
    private readonly teamUsers: TeamUserRepository,
  ) {}

  async execute(command: DeleteTeamUser): Promise<DeleteTeamUserResult> {
    const { teamId, user, userId } = command;

    const team = await this.teams.findOne({ where: { id: teamId }, relations: ['users', 'users.user'] });
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found.`);
    }

    if (user.id === userId) {
      throw new BadRequestException('You cannot remove yourself');
    }

    const { affected } = await this.teamUsers.delete({ teamId: teamId, userId });
    if (!affected) {
      throw new NotFoundException(`Team User ${teamId}, ${userId} not found.`);
    }

    const withUsers = await this.teams.findOneOrFail({ where: { id: teamId }, relations: ['users', 'users.user'] });

    // This method will catch exceptions.
    await this.notifications.unsubscribe(user.id, `teams/${team.id}`);

    return new DeleteTeamUserResult(buildTeam(withUsers));
  }
}
