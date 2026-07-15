import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamEntity, TeamRepository, TeamUserEntity, TeamUserRepository, UserEntity, UserRepository } from 'src/domain/database';
import { MemberAddedEvent } from 'src/domain/events';
import { Team, User } from '../interfaces';
import { buildTeam } from './utils';

export class SetTeamUser extends Command<SetTeamUserResponse> {
  constructor(
    public readonly teamId: number,
    public readonly userIdOrEmail: string,
    public readonly user: User,
    public readonly role: string = 'Admin',
  ) {
    super();
  }
}

export class SetTeamUserResponse {
  constructor(public readonly team: Team) {}
}

@CommandHandler(SetTeamUser)
export class SetTeamUserHandler implements ICommandHandler<SetTeamUser, any> {
  constructor(
    private readonly events: EventEmitter2,
    @InjectRepository(UserEntity)
    private readonly users: UserRepository,
    @InjectRepository(TeamEntity)
    private readonly teams: TeamRepository,
    @InjectRepository(TeamUserEntity)
    private readonly teamUsers: TeamUserRepository,
  ) {}

  async execute(command: SetTeamUser): Promise<SetTeamUserResponse> {
    const { teamId, role, user, userIdOrEmail } = command;

    const team = await this.teams.findOne({ where: { id: teamId }, relations: ['users', 'users.user'] });
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found.`);
    }

    const setUser = await this.users
      .createQueryBuilder('user')
      .where('user.id = :id', { id: userIdOrEmail })
      .orWhere('user.email = :email', { email: userIdOrEmail })
      .getOne();

    if (!setUser) {
      throw new NotFoundException(`User ${userIdOrEmail} not found.`);
    }

    if (user.id === setUser.id) {
      throw new BadRequestException('You cannot add yourself or change your own role.');
    }

    let teamUser = await this.teamUsers.findOneBy({ teamId, userId: setUser.id });
    if (teamUser) {
      teamUser.role = role;
    } else {
      teamUser = this.teamUsers.create({ teamId, role, userId: setUser.id });
    }

    await this.teamUsers.save(teamUser);

    const withUsers = await this.teams.findOne({ where: { id: teamId }, relations: ['users', 'users.user'] });
    if (!withUsers) {
      throw new NotFoundException(`Team ${teamId} was deleted in the meantime.`);
    }

    // The event logs the activity, subscribes the user and notifies the team members via the listeners.
    this.events.emit(MemberAddedEvent.TYPE, new MemberAddedEvent(team.id, setUser.email, team.name, user.id));

    return new SetTeamUserResponse(buildTeam(withUsers));
  }
}
