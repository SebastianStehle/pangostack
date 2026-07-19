import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MemberAddedEvent, MemberRemovedEvent } from 'src/domain/events';
import { NotificationsService } from '../services';
import { Topics } from '../topics';

@Injectable()
export class TeamEventListener {
  constructor(private readonly notifications: NotificationsService) {}

  @OnEvent(MemberAddedEvent.TYPE, { async: true, promisify: true })
  async onMemberAdded(event: MemberAddedEvent) {
    await this.notifications.subscribe(event.userId, Topics.team(event.teamId));
    await this.notifications.notify(Topics.team(event.teamId), 'TEAM_USER_ADDED', {
      member: event.member,
      team: event.teamName,
    });
  }

  @OnEvent(MemberRemovedEvent.TYPE, { async: true, promisify: true })
  async onMemberRemoved(event: MemberRemovedEvent) {
    await this.notifications.unsubscribe(event.userId, Topics.team(event.teamId));
    await this.notifications.notify(Topics.team(event.teamId), 'TEAM_USER_REMOVED', {
      member: event.member,
      team: event.teamName,
    });
  }
}
