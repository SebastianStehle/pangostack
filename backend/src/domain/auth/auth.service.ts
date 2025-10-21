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
import { AuthConfig } from './interfaces';

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuthService.name);

  public readonly config: Readonly<AuthConfig>;

  constructor(
    private readonly configService: ConfigService,
    private readonly notifications: NotificationsService,
    @InjectRepository(UserEntity)
    private readonly users: UserRepository,
    @InjectRepository(UserGroupEntity)
    private readonly userGroups: UserGroupRepository,
  ) {
    const config: AuthConfig = {
      baseUrl: configService.get('AUTH_BASEURL') || 'https://localhost:3000',
    };

    this.configureGithub(configService, config);
    this.configureGoogle(configService, config);
    this.configureMicrosoft(configService, config);
    this.configureOAuth2(configService, config);
    config.enablePassword = configService.get('AUTH_ENABLE_PASSWORD');

    this.config = config;
  }

  private configureGithub(configService: ConfigService, config: AuthConfig) {
    const clientId = configService.get('AUTH_GITHUB_CLIENTID');
    const clientSecret = configService.get('AUTH_GITHUB_CLIENTSECRET');

    if (clientId && clientSecret) {
      config.github = {
        clientId,
        clientSecret,
      };
    }
  }

  private configureGoogle(configService: ConfigService, config: AuthConfig) {
    const clientId = configService.get('AUTH_GOOGLE_CLIENTID');
    const clientSecret = configService.get('AUTH_GOOGLE_CLIENTSECRET');

    if (clientId && clientSecret) {
      config.google = {
        clientId,
        clientSecret,
      };
    }
  }

  private configureMicrosoft(configService: ConfigService, config: AuthConfig) {
    const clientId = configService.get('AUTH_MICROSOFT_CLIENTID');
    const clientSecret = configService.get('AUTH_MICROSOFT_CLIENTSECRET');
    const tenant = configService.get('AUTH_MICROSOFT_TENANT');

    if (clientId && clientSecret) {
      config.microsoft = {
        clientId,
        clientSecret,
        tenant,
      };
    }
  }

  private configureOAuth2(configService: ConfigService, config: AuthConfig) {
    const authorizationURL = configService.get('AUTH_OAUTH_AUTHORIZATION_URL');
    const brandColor = configService.get('AUTH_OAUTH_BRAND_COLOR');
    const brandName = configService.get('AUTH_OAUTH_BRAND_NAME');
    const clientId = configService.get('AUTH_OAUTH_CLIENTID');
    const clientSecret = configService.get('AUTH_OAUTH_CLIENTSECRET');
    const tokenURL = configService.get('AUTH_OAUTH_TOKEN_URL');
    const userInfoURL = configService.get('AUTH_OAUTH_USER_INFO_URL');

    if (authorizationURL && clientId && clientSecret && tokenURL && userInfoURL) {
      config.oauth = {
        authorizationURL,
        brandColor,
        brandName,
        clientId,
        clientSecret,
        tokenURL,
        userInfoURL,
      };
    }
  }

  async onApplicationBootstrap(): Promise<any> {
    await this.setupUsers();
    await this.setupAdmins();
  }

  private async setupAdmins() {
    const email = this.configService.get('AUTH_INITIALUSER_EMAIL');
    const apiKey = this.configService.get('AUTH_INITIALUSER_APIKEY');
    const password = this.configService.get('AUTH_INITIALUSER_PASSWORD');

    if (!email || !password) {
      return;
    }

    const count = await this.users.countBy({ userGroupId: BUILTIN_USER_GROUP_ADMIN });

    // If no admin has been created yet, the first user becomes the admin.
    if (count > 0) {
      return;
    }

    const existing = await this.users.findOneBy({ email: email });

    if (existing) {
      existing.userGroupId = BUILTIN_USER_GROUP_ADMIN;
      existing.passwordHash ||= await bcrypt.hash(password, 10);
      existing.apiKey ||= apiKey;
      await this.users.save(existing);

      // This method will catch exceptions.
      await this.notifications.upsertUsers([existing]);

      this.logger.log(`Created user with email '${email}'.`);
    } else {
      await saveAndFind(this.users, {
        id: uuid.v4(),
        apiKey,
        email,
        name: email,
        passwordHash: await bcrypt.hash(password, 10),
        userGroupId: BUILTIN_USER_GROUP_ADMIN,
      });

      this.logger.log(`Created initial user with email '${email}'.`);
    }
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

      await this.users.save(user);

      // Reload the user again to get the default values from the database.
      fromDB = await this.users.findOneBy({ id: user.id });
    }

    await new Promise((resolve) => {
      req.session.user = fromDB! as any;
      req.session.save(resolve);
    });
  }
}
