import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingEntity, SettingRepository } from 'src/domain/database';
import { saveAndFind } from 'src/lib';
import { Settings } from '../interfaces';
import { buildSettings } from './utils';

export class UpdateSettings extends Command<UpdateSettingsResult> {
  constructor(public readonly update: Partial<Settings>) {
    super();
  }
}

export class UpdateSettingsResult {
  constructor(public readonly settings: Settings) {}
}

@CommandHandler(UpdateSettings)
export class UpdateSettingsHandler implements ICommandHandler<UpdateSettings, UpdateSettingsResult> {
  constructor(
    @InjectRepository(SettingEntity)
    private readonly settings: SettingRepository,
  ) {}

  async execute(request: UpdateSettings): Promise<UpdateSettingsResult> {
    const { update } = request;

    const setting = await saveAndFind(this.settings, { id: 1, ...update });

    return new UpdateSettingsResult(buildSettings(setting));
  }
}
