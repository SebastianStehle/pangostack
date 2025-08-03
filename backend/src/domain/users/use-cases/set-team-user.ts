import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamEntity, TeamRepository, TeamUserRepository, UserEntity, UserRepository } from 'src/domain/database';
import { Team, User } from '../interfaces';
import { buildTeam } from './utils';

export class SetTeamUser {
  constructor(
    public readonly id: number,
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
    const { id, role, user, userId } = command;

    const team = await this.teams.findOne({ where: { id }, relations: ['users', 'users.user'] });
    if (!team) {
      throw new NotFoundException(`Team ${id} not found.`);
    }

    const setUser = await this.users.findOneBy({ id: userId });
    if (!setUser) {
      throw new NotFoundException(`User ${userId} not found.`);
    }

    if (user.id === userId) {
      throw new BadRequestException('You cannot add yourself or change your own role.');
    }

    const teamUser = await this.teamUsers.findOneBy({ teamId: id, userId });
    if (user) {
      teamUser.role = role;
      await this.teamUsers.save(teamUser);
    } else {
      this.teamUsers.save({ teamId: id, role, userId });
    }

    const withUsers = await this.teams.findOne({ where: { id }, relations: ['users', 'users.user'] });

    return new SetTeamUserResponse(buildTeam(withUsers));
  }
}
