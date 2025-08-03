import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingEntity, SettingRepository } from 'src/domain/database';
import { Settings } from '../interfaces';
import { buildSettings } from './utils';

export class GetSettings {}

export class GetSettingsResponse {
  constructor(public readonly settings: Settings) {}
}

@QueryHandler(GetSettings)
export class GetSettingsHandler implements IQueryHandler<GetSettings, GetSettingsResponse> {
  constructor(
    @InjectRepository(SettingEntity)
    private readonly settings: SettingRepository,
  ) {}

  async execute(): Promise<GetSettingsResponse> {
    const setting = await this.settings.findOneBy({ id: 1 });

    return new GetSettingsResponse(buildSettings(setting || ({} as any)));
  }
}
