import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { TeamEntity, TeamRepository } from 'src/domain/database';

@Injectable()
export class TeamPermissionGuard implements CanActivate {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teams: TeamRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const teamId = Number(request.params.teamId);

    const team = await this.teams.findOne({
      where: { id: teamId },
      relations: ['users'],
    });

    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found.`);
    }

    const user = request.user;

    const isMember = team.users.some((u) => u.userId === user.id);
    if (!isMember) {
      throw new ForbiddenException('You do not have access to this team.');
    }

    return true;
  }
}
