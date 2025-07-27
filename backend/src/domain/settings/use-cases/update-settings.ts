import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingEntity, SettingRepository } from 'src/domain/database';
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

    const updated = await this.settings.save({ id: 1, ...update });
    const result = buildSettings(updated);

    return new UpdateSettingsResponse(result);
  }
}
