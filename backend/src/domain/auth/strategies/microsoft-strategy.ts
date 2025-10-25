import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { User } from 'src/domain/users';
import { UrlService } from 'src/lib';
import { AuthService } from '../auth.service';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(authService: AuthService, urlService: UrlService) {
    super({
      callbackURL: urlService.buildUrl('/api/auth/login/microsoft/callback'),
      clientID: authService.config.microsoft?.clientId || 'INVALID',
      clientSecret: authService.config.microsoft?.clientSecret || 'INVALID',
      scope: ['user.read'],
      tenant: authService.config.microsoft?.tenant || 'common',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<Partial<User>> {
    const { id, emails, displayName: name, picture } = profile;

    const user = {
      id,
      accessToken,
      email: emails[0].value,
      name,
      picture,
      refreshToken,
    };

    return user;
  }
}
