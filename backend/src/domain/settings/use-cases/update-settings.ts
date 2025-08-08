import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingEntity, SettingRepository } from 'src/domain/database';
import { saveAndFind } from 'src/lib';
import { Settings } from '../interfaces';
import { buildSettings } from './utils';

export class UpdateSettings {
  constructor(public readonly update: Partial<Settings>) {}
}

export class UpdateSettingsResponse {
  constructor(public readonly settings: Settings) {}
}

@CommandHandler(UpdateSettings)
export class UpdateSettingsHandler implements ICommandHandler<UpdateSettings, UpdateSettingsResponse> {
  constructor(
    @InjectRepository(SettingEntity)
    private readonly settings: SettingRepository,
  ) {}

  async execute(request: UpdateSettings): Promise<UpdateSettingsResponse> {
    const { update } = request;

    const setting = await saveAndFind(this.settings, { id: 1, ...update });

    return new UpdateSettingsResponse(buildSettings(setting));
  }
}
