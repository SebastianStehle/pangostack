import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamEntity, TeamRepository, TeamUserRepository, UserEntity, UserRepository } from 'src/domain/database';
import { Team, User } from '../interfaces';
import { buildTeam } from './utils';

export class SetTeamUser {
  constructor(
    public readonly teamId: number,
    public readonly userId: string,
    public readonly user: User,
    public readonly role: string,
  ) {}
}

export class SetTeamUserResponse {
  constructor(public readonly team: Team) {}
}

@CommandHandler(SetTeamUser)
export class SetTeamUserHandler implements ICommandHandler<SetTeamUser, any> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: UserRepository,
    @InjectRepository(TeamEntity)
    private readonly teams: TeamRepository,
    @InjectRepository(UserEntity)
    private readonly teamUsers: TeamUserRepository,
  ) {}

  async execute(command: SetTeamUser): Promise<SetTeamUserResponse> {
    const { teamId, role, user, userId } = command;

    const team = await this.teams.findOne({ where: { id: teamId }, relations: ['users', 'users.user'] });
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found.`);
    }

    const setUser = await this.users.findOneBy({ id: userId });
    if (!setUser) {
      throw new NotFoundException(`User ${userId} not found.`);
    }

    if (user.id === userId) {
      throw new BadRequestException('You cannot add yourself or change your own role.');
    }

    let teamUser = await this.teamUsers.findOneBy({ teamId, userId });
    if (teamUser) {
      teamUser.role = role;
    } else {
      teamUser = this.teamUsers.create({ teamId, role, userId });
    }

    await this.teamUsers.save(teamUser);

    const withUsers = await this.teams.findOne({ where: { id: teamId }, relations: ['users', 'users.user'] });
    if (!withUsers) {
      throw new NotFoundException(`Team ${teamId} was deleted in the meantime.`);
    }

    return new SetTeamUserResponse(buildTeam(withUsers));
  }
}
