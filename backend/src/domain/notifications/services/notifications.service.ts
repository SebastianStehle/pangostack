import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotifoClient } from '@notifo/notifo';

export interface NotifoConfig {
  apiKey: string;
  apiUrl: string;
  appId: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly client?: NotifoClient;
  private readonly config?: NotifoConfig;

  constructor(configService: ConfigService) {
    this.config = configService.get<NotifoConfig>('notifo');

    if (this.config?.apiKey && this.config?.apiUrl) {
      this.client = new NotifoClient({ apiKey: this.config.apiKey, url: this.config.apiUrl });
    }
  }

  async getToken(userId: string): Promise<{ apiKey: string; url: string } | null> {
    if (!this.client || !this.config) {
      return null;
    }

    const user = await this.client.users.getUser(this.config.appId, userId);
    if (!user) {
      return null;
    }

    return { apiKey: user.apiKey, url: this.config.apiUrl };
  }

  async notify(topic: string, templateCode: string, properties = {}) {
    if (!this.client || !this.config) {
      return;
    }

    try {
      await this.client.events.postEvents(this.config.appId, {
        requests: [{ topic, templateCode, properties }],
      });
    } catch (ex: unknown) {
      this.logger.error(`Failed to notify users at topic ${topic}`, ex);
    }
  }

  async subscribe(userId: string, topic: string) {
    if (!this.client || !this.config) {
      return;
    }

    try {
      await this.client.users.postSubscriptions(this.config.appId, userId, {
        subscribe: [{ topicPrefix: topic }],
      });
    } catch (ex: unknown) {
      this.logger.error(`Failed to subscribe user ${userId} to topic ${topic}`, ex);
    }
  }

  async unsubscribe(userId: string, topic: string) {
    if (!this.client || !this.config) {
      return;
    }

    try {
      await this.client.users.postSubscriptions(this.config.appId, userId, {
        unsubscribe: [topic],
      });
    } catch (ex: unknown) {
      this.logger.error(`Failed to unsubscribe user ${userId} from topic ${topic}`, ex);
    }
  }

  async upsertUsers(users: { id: string; email?: string; name?: string }[]) {
    if (!this.client || !this.config) {
      return;
    }

    try {
      await this.client.users.postUsers(this.config.appId, {
        requests: users.map((u) => ({ ...u, settings: { email: { send: 'Send', condition: 'Always', required: 'Inherit' } } })),
      });
    } catch (ex: unknown) {
      this.logger.error('Failed to upsert users', ex);
    }
  }
}
