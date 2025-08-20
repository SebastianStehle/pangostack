import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingEntity, SettingRepository } from 'src/domain/database';
import { Settings } from '../interfaces';
import { buildSettings } from './utils';

export class GetSettingsQuery extends Query<GetSettingsResult> {}

export class GetSettingsResult {
  constructor(public readonly settings: Settings) {}
}

@QueryHandler(GetSettingsQuery)
export class GetSettingsHandler implements IQueryHandler<GetSettingsQuery, GetSettingsResult> {
  constructor(
    @InjectRepository(SettingEntity)
    private readonly settings: SettingRepository,
  ) {}

  async execute(): Promise<GetSettingsResult> {
    const setting = await this.settings.findOneBy({ id: 1 });

    return new GetSettingsResult(buildSettings(setting || ({} as any)));
  }
}
