import { TypeOrmModule } from '@nestjs/typeorm';
import { createIntegrationTest, IntegrationTestContext, uniqueId } from 'test/integration/setup';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BlobEntity, SettingEntity } from 'src/domain/database';
import {
  DeleteBlob,
  DeleteBlobHandler,
  GetBlobHandler,
  GetBlobQuery,
  GetBlobResult,
  GetSettingsHandler,
  GetSettingsQuery,
  GetSettingsResult,
  UpdateSettings,
  UpdateSettingsHandler,
  UpdateSettingsResult,
  UploadBlob,
  UploadBlobHandler,
} from '.';

describe('settings handlers', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await createIntegrationTest({
      imports: [TypeOrmModule.forFeature([SettingEntity, BlobEntity])],
      providers: [GetSettingsHandler, UpdateSettingsHandler, GetBlobHandler, UploadBlobHandler, DeleteBlobHandler],
    });
  });

  afterAll(async () => {
    await context.close();
  });

  describe('GetSettingsQuery', () => {
    it('should return the stored settings singleton', async () => {
      await context.dataSource.getRepository(SettingEntity).save({ id: 1, name: 'Acme SaaS' });

      const { settings } = await context.queryBus.execute<GetSettingsQuery, GetSettingsResult>(new GetSettingsQuery());

      expect(settings.name).toBe('Acme SaaS');
    });

    it('should fall back to defaults when values are unset', async () => {
      await context.dataSource.getRepository(SettingEntity).save({ id: 1, name: null, primaryColor: null });

      const { settings } = await context.queryBus.execute<GetSettingsQuery, GetSettingsResult>(new GetSettingsQuery());

      expect(settings.name).toBe('My Saas Project');
      expect(settings.primaryColor).toBe('#491eff');
    });
  });

  describe('UpdateSettings', () => {
    it('should update the settings singleton', async () => {
      const { settings } = await context.commandBus.execute<UpdateSettings, UpdateSettingsResult>(
        new UpdateSettings({ name: 'Updated' }),
      );

      expect(settings.name).toBe('Updated');
    });

    it('should update individual fields without touching the others', async () => {
      await context.commandBus.execute<UpdateSettings, UpdateSettingsResult>(new UpdateSettings({ name: 'Keep' }));

      const { settings } = await context.commandBus.execute<UpdateSettings, UpdateSettingsResult>(
        new UpdateSettings({ primaryColor: '#123456' }),
      );

      expect(settings.name).toBe('Keep');
      expect(settings.primaryColor).toBe('#123456');
    });
  });

  describe('UploadBlob + GetBlobQuery', () => {
    it('should store a blob and read it back decoded', async () => {
      const blobId = uniqueId('blob');
      const payload = Buffer.from('hello world');

      await context.commandBus.execute(new UploadBlob(blobId, payload, 'text/plain', 'hello.txt', payload.length));

      const { file } = await context.queryBus.execute<GetBlobQuery, GetBlobResult>(new GetBlobQuery(blobId));

      expect(file?.type).toBe('text/plain');
      expect(file?.buffer.toString()).toBe('hello world');
    });

    it('should return no file for a missing blob', async () => {
      const { file } = await context.queryBus.execute<GetBlobQuery, GetBlobResult>(new GetBlobQuery(uniqueId('blob')));

      expect(file).toBeUndefined();
    });
  });

  describe('DeleteBlob', () => {
    it('should delete a blob', async () => {
      const blobId = uniqueId('blob');
      await context.dataSource.getRepository(BlobEntity).save({ id: blobId, type: 'text/plain', buffer: '' });

      await context.commandBus.execute(new DeleteBlob(blobId));

      expect(await context.dataSource.getRepository(BlobEntity).findOneBy({ id: blobId })).toBeNull();
    });

    it('should throw when the blob does not exist', async () => {
      await expect(context.commandBus.execute(new DeleteBlob(uniqueId('blob')))).rejects.toThrow('not found');
    });
  });
});
