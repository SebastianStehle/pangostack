import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth2';
import { User } from 'src/domain/users';
import { UrlService } from 'src/lib';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(authService: AuthService, urlService: UrlService) {
    super({
      callbackURL: urlService.buildUrl('/api/auth/login/google/callback'),
      clientID: authService.config.google?.clientId || 'INVALID',
      clientSecret: authService.config.google?.clientSecret || 'INVALID',
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<Partial<User>> {
    const { id, email, displayName: name, picture } = profile;

    const user = {
      id,
      accessToken,
      email,
      name,
      picture,
      refreshToken,
    };

    return user;
  }
}
