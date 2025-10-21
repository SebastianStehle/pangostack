import { NotificationsService } from 'src/domain/notifications';
import { Activity } from '../registration';

export type NotifyParams = { topic: string; templateCode: string; properties: object };

@Activity(notify)
export class NotifyActivity implements Activity<NotifyParams> {
  constructor(private readonly notifications: NotificationsService) {}

  async execute(param: NotifyParams) {
    const { topic, templateCode, properties } = param;

    await this.notifications.notify(topic, templateCode, properties);
  }
}

export async function notify(param: NotifyParams): Promise<any> {
  return param;
}
