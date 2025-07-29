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

    let entity = await this.teamUsers.findOneBy({ teamId: id, userId });
    if (user) {
      entity.role = role;
    } else {
      entity = this.teamUsers.create();
      entity.userId = userId;
      entity.teamId = id;
      entity.role = role;
    }

    await this.teamUsers.save(entity);

    // Reload the team to ge tupdates relations.
    const updated = await this.teams.findOne({ where: { id }, relations: ['users', 'users.user'] });
    const result = buildTeam(updated);

    return new SetTeamUserResponse(result);
  }
}
