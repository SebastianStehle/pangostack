import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface AuthConfig {
  github?: {
    clientId: string;
    clientSecret: string;
  };
  google?: {
    clientId: string;
    clientSecret: string;
  };
  microsoft?: {
    clientId: string;
    clientSecret: string;
    tenant?: string;
  };
  oauth?: {
    authorizationURL: string;
    brandName?: string;
    brandColor?: string;
    clientId: string;
    clientSecret: string;
    tokenURL: string;
    userInfoURL: string;
  };
  initialUser?: {
    email: string;
    password: string;
    apiKey?: string;
  };
  enablePassword?: boolean;
}

export const AUTH_ENV_SCHEMA = Joi.object({
  AUTH_GITHUB_CLIENTID: Joi.string().optional(),
  AUTH_GITHUB_CLIENTSECRET: Joi.when('AUTH_GITHUB_CLIENTID', {
    is: Joi.exist(),
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  AUTH_GOOGLE_CLIENTID: Joi.string().optional(),
  AUTH_GOOGLE_CLIENTSECRET: Joi.when('AUTH_GOOGLE_CLIENTID', {
    is: Joi.exist(),
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  AUTH_MICROSOFT_CLIENTID: Joi.string().optional(),
  AUTH_MICROSOFT_CLIENTSECRET: Joi.when('AUTH_MICROSOFT_CLIENTID', {
    is: Joi.exist(),
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  AUTH_MICROSOFT_TENANT: Joi.string().optional(),
  AUTH_OAUTH_CLIENTID: Joi.string().optional(),
  AUTH_OAUTH_CLIENTSECRET: Joi.when('AUTH_OAUTH_CLIENTID', {
    is: Joi.exist(),
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  AUTH_OAUTH_AUTHORIZATION_URL: Joi.when('AUTH_OAUTH_CLIENTID', {
    is: Joi.exist(),
    then: Joi.string().uri().required(),
    otherwise: Joi.string().optional(),
  }),
  AUTH_OAUTH_TOKEN_URL: Joi.when('AUTH_OAUTH_CLIENTID', {
    is: Joi.exist(),
    then: Joi.string().uri().required(),
    otherwise: Joi.string().optional(),
  }),
  AUTH_OAUTH_USERINFO_URL: Joi.when('AUTH_OAUTH_CLIENTID', {
    is: Joi.exist(),
    then: Joi.string().uri().required(),
    otherwise: Joi.string().optional(),
  }),
  AUTH_OAUTH_BRAND_NAME: Joi.string().optional(),
  AUTH_OAUTH_BRAND_COLOR: Joi.string().optional(),
  AUTH_INITIAL_USER_EMAIL: Joi.string().optional(),
  AUTH_INITIAL_USER_API_KEY: Joi.string().optional(),
  AUTH_INITIAL_USER_PASSWORD: Joi.when('AUTH_INITIAL_USER_EMAIL', {
    is: Joi.exist(),
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  AUTH_ENABLE_PASSWORD: Joi.string().valid('true', 'false').optional(),
}).unknown(true);

export const authConfig = registerAs<AuthConfig>('auth', () => {
  const githubClientId = process.env.AUTH_GITHUB_CLIENTID;
  const githubClientSecret = process.env.AUTH_GITHUB_CLIENTSECRET;
  const googleClientId = process.env.AUTH_GOOGLE_CLIENTID;
  const googleClientSecret = process.env.AUTH_GOOGLE_CLIENTSECRET;
  const microsoftClientId = process.env.AUTH_MICROSOFT_CLIENTID;
  const microsoftClientSecret = process.env.AUTH_MICROSOFT_CLIENTSECRET;
  const microsoftTenant = process.env.AUTH_MICROSOFT_TENANT;
  const oauthClientId = process.env.AUTH_OAUTH_CLIENTID;
  const oauthClientSecret = process.env.AUTH_OAUTH_CLIENTSECRET;
  const oauthAuthorizationUrl = process.env.AUTH_OAUTH_AUTHORIZATION_URL;
  const oauthTokenUrl = process.env.AUTH_OAUTH_TOKEN_URL;
  const oauthUserinfoUrl = process.env.AUTH_OAUTH_USERINFO_URL;
  const oauthBrandName = process.env.AUTH_OAUTH_BRAND_NAME;
  const oauthBrandColor = process.env.AUTH_OAUTH_BRAND_COLOR;
  const initialUserEmail = process.env.AUTH_INITIAL_USER_EMAIL;
  const initialUserPassword = process.env.AUTH_INITIAL_USER_PASSWORD;
  const initialUserApiKey = process.env.AUTH_INITIAL_USER_API_KEY;
  const enablePassword = process.env.AUTH_ENABLE_PASSWORD;

  return {
    github:
      githubClientId && githubClientSecret
        ? {
            clientId: githubClientId,
            clientSecret: githubClientSecret,
          }
        : undefined,
    google:
      googleClientId && googleClientSecret
        ? {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }
        : undefined,
    microsoft:
      microsoftClientId && microsoftClientSecret
        ? {
            clientId: microsoftClientId,
            clientSecret: microsoftClientSecret,
            tenant: microsoftTenant,
          }
        : undefined,
    oauth:
      oauthClientId && oauthClientSecret && oauthAuthorizationUrl && oauthTokenUrl && oauthUserinfoUrl
        ? {
            authorizationURL: oauthAuthorizationUrl,
            brandName: oauthBrandName,
            brandColor: oauthBrandColor,
            clientId: oauthClientId,
            clientSecret: oauthClientSecret,
            tokenURL: oauthTokenUrl,
            userInfoURL: oauthUserinfoUrl,
          }
        : undefined,
    initialUser:
      initialUserEmail && initialUserPassword
        ? {
            email: initialUserEmail,
            password: initialUserPassword,
            apiKey: initialUserApiKey,
          }
        : undefined,
    enablePassword: enablePassword === 'true',
  };
});
