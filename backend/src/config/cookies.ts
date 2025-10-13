import { INestApplication } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { SessionStorage } from 'src/domain/auth';

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function getSecret() {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }
  if (!IS_PRODUCTION) {
    return 'secret';
  }
  throw new Error('SESSION_SECRET must be defined for production');
}

const SESSION_SECRET = getSecret();

export function appSession(app: INestApplication) {
  return session({
    cookie: {
      sameSite: IS_PRODUCTION ? 'none' : 'lax',
      secure: IS_PRODUCTION,
      maxAge: SEVEN_DAYS_IN_MS,
    },
    proxy: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: app.get(SessionStorage),
    resave: true,
  });
}

export function appCookies() {
  return cookieParser();
}
