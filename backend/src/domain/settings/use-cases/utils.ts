import { SettingEntity } from 'src/domain/database';
import { Settings } from '../interfaces';

export function buildSettings(source: SettingEntity): Settings {
  // eslint-disable-next-line prefer-const
  let { headerColor, name, primaryColor, primaryContentColor, ...other } = source;

  name ||= 'My Saas Project';
  primaryColor ||= '#491eff';
  primaryContentColor ||= '#ffffff';
  headerColor ||= '#491eff';

  return {
    headerColor,
    name,
    primaryColor,
    primaryContentColor,
    ...other,
  };
}
