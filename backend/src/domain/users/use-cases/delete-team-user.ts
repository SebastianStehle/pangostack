import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamEntity, TeamRepository, TeamUserRepository, UserEntity } from 'src/domain/database';
import { Team, User } from '../interfaces';
import { buildTeam } from './utils';

export class DeleteTeamUser {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly user: User,
  ) {}
}

export class DeleteTeamUserResponse {
  constructor(public readonly team: Team) {}
}

@CommandHandler(DeleteTeamUser)
export class DeleteTeamUserHandler implements ICommandHandler<DeleteTeamUser, DeleteTeamUserResponse> {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teams: TeamRepository,
    @InjectRepository(UserEntity)
    private readonly teamUsers: TeamUserRepository,
  ) {}

  async execute(command: DeleteTeamUser): Promise<DeleteTeamUserResponse> {
    const { id, user, userId } = command;

    const team = await this.teams.findOne({ where: { id }, relations: ['users', 'users.user'] });
    if (!team) {
      throw new NotFoundException(`Team ${id} not found.`);
    }

    if (user.id === userId) {
      throw new BadRequestException('You cannot remove yourself');
    }

    const result = await this.teamUsers.delete({ teamId: id, userId });
    if (!result.affected) {
      throw new NotFoundException(`Team User ${id}, ${userId} not found.`);
    }

    // Reload the team to ge tupdates relations.
    const updated = await this.teams.findOne({ where: { id }, relations: ['users', 'users.user'] });
    return new DeleteTeamUserResponse(buildTeam(updated));
  }
}
