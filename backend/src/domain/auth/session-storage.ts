import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionData, Store } from 'express-session';
import { saveAndFind } from 'src/lib';
import { SessionEntity, SessionRepository } from '../database';

@Injectable()
export class SessionStorage extends Store {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessions: SessionRepository,
  ) {
    super();
  }

  async get(sid: string, callback: (err: any, session?: SessionData) => void) {
    try {
      const session = await this.sessions.findOneBy({ id: sid });

      callback(undefined, session?.value);
    } catch (ex) {
      callback(ex);
    }
  }

  async set(sid: string, session: SessionData, callback?: (err?: any) => void) {
    try {
      await saveAndFind(this.sessions, { id: sid, value: session as any });

      callback?.();
    } catch (ex) {
      callback?.(ex);
    }
  }

  async destroy(sid: string, callback?: (err?: any) => void) {
    try {
      await this.sessions.delete({ id: sid });

      callback?.();
    } catch (ex) {
      callback?.(ex);
    }
  }
}
