import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { User } from 'src/domain/users';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(authService: AuthService) {
    super({
      callbackURL: `${authService.config.baseUrl}/api/auth/login/github/callback`,
      clientID: authService.config.github?.clientId || 'INVALID',
      clientSecret: authService.config.github?.clientSecret || 'INVALID',
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<Partial<User>> {
    const { id, email, displayName: name, picture } = profile;

    const user = {
      id,
      accessToken,
      email: email || name,
      name,
      picture,
      refreshToken,
    };

    return user;
  }
}
