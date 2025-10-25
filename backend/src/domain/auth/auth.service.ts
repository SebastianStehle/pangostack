import { BadRequestException, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import * as uuid from 'uuid';
import { saveAndFind } from 'src/lib';
import {
  BUILTIN_USER_GROUP_ADMIN,
  BUILTIN_USER_GROUP_DEFAULT,
  UserEntity,
  UserGroupEntity,
  UserGroupRepository,
  UserRepository,
} from '../database';
import { NotificationsService } from '../notifications';
import { User } from '../users';
import { AuthConfig } from './config';

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuthService.name);

  public readonly config: Readonly<AuthConfig>;

  constructor(
    configService: ConfigService,
    private readonly notifications: NotificationsService,
    @InjectRepository(UserEntity)
    private readonly users: UserRepository,
    @InjectRepository(UserGroupEntity)
    private readonly userGroups: UserGroupRepository,
  ) {
    this.config = configService.getOrThrow<AuthConfig>('auth');
  }

  async onApplicationBootstrap(): Promise<any> {
    await this.setupUsers();
    await this.setupAdmins();
  }

  private async setupAdmins() {
    const { email, password, apiKey } = this.config.initialUser || {};

    if (!email || !password) {
      return;
    }

    const count = await this.users.countBy({ userGroupId: BUILTIN_USER_GROUP_ADMIN });

    // If no admin has been created yet, the first user becomes the admin.
    if (count > 0) {
      return;
    }

    let existing = await this.users.findOneBy({ email: email });
    if (existing) {
      existing.apiKey ||= apiKey;
      existing.userGroupId = BUILTIN_USER_GROUP_ADMIN;
      existing.passwordHash ||= await bcrypt.hash(password, 10);

      this.logger.log(`Creating user with email '${email}'.`);
    } else {
      existing = this.users.create({
        id: uuid.v4(),
        apiKey,
        email,
        name: email,
        passwordHash: await bcrypt.hash(password, 10),
        userGroupId: BUILTIN_USER_GROUP_ADMIN,
      });

      this.logger.log(`Creating initial user with email '${email}'.`);
    }

    await this.users.save(existing);

    // This method will catch exceptions.
    await this.notifications.upsertUsers([existing]);
  }

  private async setupUsers() {
    const count = await this.userGroups.count();

    if (count > 0) {
      return;
    }

    await this.userGroups.save([
      {
        id: BUILTIN_USER_GROUP_ADMIN,
        name: 'Admin',
        isAdmin: true,
        isBuiltIn: true,
      },
      {
        id: BUILTIN_USER_GROUP_DEFAULT,
        name: 'Default',
        isAdmin: false,
        isBuiltIn: true,
      },
    ]);
  }

  async logout(req: Request) {
    await new Promise((resolve) => {
      req.session.user = undefined;
      req.session.save(resolve);
    });
  }

  async loginWithPassword(email: string, password: string, req: Request) {
    const user = await this.users.findOneBy({ email });

    // We cannot compare the password in the database due to the salt.
    if (!user?.passwordHash) {
      throw new BadRequestException('Unknown user.');
    }

    if (!(await bcrypt.compare(password, user.passwordHash))) {
      throw new BadRequestException('Wrong password.');
    }

    await new Promise((resolve) => {
      req.session.user = user as any;
      req.session.save(resolve);
    });
  }

  async login(user: User, req: Request) {
    // Check if the user exist in the database.
    let fromDB = await this.users.findOneBy({ id: user.id });

    if (!fromDB) {
      const countAdmins = await this.users.countBy({ userGroupId: BUILTIN_USER_GROUP_ADMIN });

      // If no admin has been created yet, the first user becomes the admin.
      if (countAdmins === 0) {
        user.userGroupId = BUILTIN_USER_GROUP_ADMIN;
      } else {
        user.userGroupId = BUILTIN_USER_GROUP_DEFAULT;
      }

      fromDB = await saveAndFind(this.users, user);
    }

    await new Promise((resolve) => {
      req.session.user = fromDB! as any;
      req.session.save(resolve);
    });
  }
}
