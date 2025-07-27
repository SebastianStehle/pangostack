import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { isString } from 'class-validator';
import { Request } from 'express';
import { Strategy } from 'passport-custom';
import { UserEntity, UserRepository } from 'src/domain/database';
import { User } from 'src/domain/users';
import { isArray } from 'src/lib';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  private readonly headers = ['x-api-key', 'x-apikey', 'api-key', 'apikey'];

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: UserRepository,
  ) {
    super();
  }

  async validate(request: Request): Promise<Partial<User>> {
    const apiKey = this.findApiKey(request);

    if (apiKey) {
      return await this.userRepository.findOneBy({ apiKey });
    } else if (request.session.user) {
      // Always replace the current user to get the current user group in the domain layer.
      return await this.userRepository.findOneBy({ id: request.session.user.id });
    }

    return null;
  }

  private findApiKey(request: Request) {
    for (const candidate of this.headers) {
      const apiKeyHeader = request.headers[candidate];
      const apiKeyValue = isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;

      if (isString(apiKeyValue) && apiKeyValue.trim().length > 0) {
        return apiKeyValue;
      }
    }

    return null;
  }
}
