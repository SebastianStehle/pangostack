import { DeepPartial, FindOneOptions, ObjectLiteral, Repository } from 'typeorm';

export async function saveAndFind<T extends ObjectLiteral>(
  repository: Repository<T>,
  values: DeepPartial<T>,
  options?: FindOneOptions<T>,
): Promise<T> {
  const entity = repository.create(values);
  await repository.save(entity);

  const primaryKeys = repository.metadata.primaryColumns;

  options ||= {};
  options.where = {};
  for (const key of primaryKeys) {
    const keyName = key.propertyName as keyof T;

    options.where[keyName] = entity[keyName];
  }

  return await repository.findOneOrFail(options);
}
