import { describe, expect, it } from 'vitest';
import { SettingEntity } from 'src/domain/database';
import { buildSettings } from './utils';

describe('buildSettings', () => {
  it('should apply the branding defaults when values are unset', () => {
    const settings = buildSettings({} as SettingEntity);

    expect(settings.name).toBe('My Saas Project');
    expect(settings.primaryColor).toBe('#491eff');
    expect(settings.primaryContentColor).toBe('#ffffff');
    expect(settings.headerColor).toBe('#491eff');
  });

  it('should keep the stored values when they are set', () => {
    const settings = buildSettings({ name: 'Acme', primaryColor: '#111111' } as SettingEntity);

    expect(settings.name).toBe('Acme');
    expect(settings.primaryColor).toBe('#111111');
  });
});
