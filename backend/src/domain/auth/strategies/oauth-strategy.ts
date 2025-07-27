import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { User } from 'src/domain/users';
import { InternalError } from 'src/lib';
import { AuthService } from '../auth.service';

@Injectable()
export class OAuthStrategy extends PassportStrategy(Strategy, 'oauth2') {
  private readonly userInfoURL;

  constructor(authService: AuthService) {
    super({
      authorizationURL: authService.config.oauth?.authorizationURL || 'INVALID',
      callbackURL: `${authService.config.baseUrl}/auth/login/oauth/callback`,
      clientID: authService.config.oauth?.clientId || 'INVALID',
      clientSecret: authService.config.oauth?.clientSecret || 'INVALID',
      scope: ['openid', 'profile', 'email'],
      tokenURL: authService.config.oauth?.tokenURL || 'INVALID',
    });

    this.userInfoURL = authService.config.oauth?.userInfoURL || 'INVALID';
  }

  userProfile(accessToken: string, done: (error?: Error, result?: any) => void) {
    this._oauth2.useAuthorizationHeaderforGET(true);
    this._oauth2.get(this.userInfoURL, accessToken, function (err, body) {
      let json;

      if (err) {
        if (err.data) {
          try {
            json = JSON.parse(err.data);
          } catch (_) {}
        }

        if (json && json.error && json.error.message) {
          return done(new Error(`Error: ${json.error.message}. Status Code: ${json.error.code}.`));
        } else if (json && json.error && json.error_description) {
          return done(new Error(`Error: ${json.error_description}. Status Code: ${json.error}.`));
        }
        return done(new InternalError('Failed to fetch user profile', { cause: err }));
      }

      if (err) {
        if (err.data) {
          try {
            json = JSON.parse(err.data);
          } catch (_) {}
        }
      }

      try {
        json = JSON.parse(body as any);
      } catch (ex) {
        return done(new InternalError('Failed to parse user profile', { cause: err }));
      }

      done(null, json);
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<Partial<User>> {
    const { sub: id, name, email } = profile;

    const user = {
      id,
      accessToken,
      email,
      name: name || email,
      refreshToken,
    };

    return user;
  }
}
