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
  GITHUB_CLIENT_ID: Joi.string().optional(),
  GITHUB_CLIENT_SECRET: Joi.when('GITHUB_CLIENT_ID', {
    is: Joi.exist(),
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.when('GOOGLE_CLIENT_ID', {
    is: Joi.exist(),
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  MICROSOFT_CLIENT_ID: Joi.string().optional(),
  MICROSOFT_CLIENT_SECRET: Joi.when('MICROSOFT_CLIENT_ID', {
    is: Joi.exist(),
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  MICROSOFT_TENANT: Joi.string().optional(),
  OAUTH_CLIENT_ID: Joi.string().optional(),
  OAUTH_CLIENT_SECRET: Joi.when('OAUTH_CLIENT_ID', {
    is: Joi.exist(),
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  OAUTH_AUTHORIZATION_URL: Joi.when('OAUTH_CLIENT_ID', {
    is: Joi.exist(),
    then: Joi.string().uri().required(),
    otherwise: Joi.string().optional(),
  }),
  OAUTH_TOKEN_URL: Joi.when('OAUTH_CLIENT_ID', {
    is: Joi.exist(),
    then: Joi.string().uri().required(),
    otherwise: Joi.string().optional(),
  }),
  OAUTH_USERINFO_URL: Joi.when('OAUTH_CLIENT_ID', {
    is: Joi.exist(),
    then: Joi.string().uri().required(),
    otherwise: Joi.string().optional(),
  }),
  OAUTH_BRAND_NAME: Joi.string().optional(),
  OAUTH_BRAND_COLOR: Joi.string().optional(),
  INITIAL_USER_EMAIL: Joi.string().optional(),
  INITIAL_USER_API_KEY: Joi.string().optional(),
  INITIAL_USER_PASSWORD: Joi.when('INITIAL_USER_EMAIL', {
    is: Joi.exist(),
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  ENABLE_PASSWORD: Joi.string().valid('true', 'false').optional(),
}).unknown(true);

export const authConfig = registerAs<AuthConfig>('auth', () => {
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const microsoftClientId = process.env.MICROSOFT_CLIENT_ID;
  const microsoftClientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const microsoftTenant = process.env.MICROSOFT_TENANT;
  const oauthClientId = process.env.OAUTH_CLIENT_ID;
  const oauthClientSecret = process.env.OAUTH_CLIENT_SECRET;
  const oauthAuthorizationUrl = process.env.OAUTH_AUTHORIZATION_URL;
  const oauthTokenUrl = process.env.OAUTH_TOKEN_URL;
  const oauthUserinfoUrl = process.env.OAUTH_USERINFO_URL;
  const oauthBrandName = process.env.OAUTH_BRAND_NAME;
  const oauthBrandColor = process.env.OAUTH_BRAND_COLOR;
  const initialUserEmail = process.env.INITIAL_USER_EMAIL;
  const initialUserPassword = process.env.INITIAL_USER_PASSWORD;
  const initialUserApiKey = process.env.INITIAL_USER_API_KEY;
  const enablePassword = process.env.ENABLE_PASSWORD;

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
