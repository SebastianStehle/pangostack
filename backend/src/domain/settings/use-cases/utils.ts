import { SettingEntity } from 'src/domain/database';
import { Settings } from '../interfaces';

export function buildSettings(source: SettingEntity): Settings {
  // eslint-disable-next-line prefer-const
  let { name, primaryColor, primaryContentColor, ...other } = source;

  name ||= 'CompanyChat';
  primaryColor ||= '#491eff';
  primaryContentColor ||= '#ffffff';

  return {
    name,
    primaryColor,
    primaryContentColor,
    ...other,
  };
}
