import { User } from '../users';

declare module 'express' {
  interface Request {
    user: User;
  }
}

declare module 'express-session' {
  interface SessionData {
    user: User;
  }
}

export {};
