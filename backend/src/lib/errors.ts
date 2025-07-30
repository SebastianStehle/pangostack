import { ValidationError } from 'class-validator';
import { iterate } from 'iterare';

export class InternalError {
  public readonly message: string;
  public readonly name = 'InternalError';

  constructor(
    public readonly content: string,
    public readonly options?: { cause: any },
  ) {
    let message = content;

    if (this.options?.cause) {
      message += '\n';
      message += `Caused by: ${JSON.stringify(this.options.cause)}`;
    }

    this.message = message;
  }
}

export function flattenValidationErrors(validationErrors: ValidationError[]): string[] {
  return iterate(validationErrors)
    .map((error) => mapChildrenToValidationErrors(error))
    .flatten()
    .filter((item) => !!item.constraints)
    .map((item) => Object.values(item.constraints!))
    .flatten()
    .toArray();
}

function mapChildrenToValidationErrors(error: ValidationError, parentPath?: string): ValidationError[] {
  if (!(error.children && error.children.length)) {
    return [error];
  }

  const validationErrors: ValidationError[] = [];

  parentPath = parentPath ? `${parentPath}.${error.property}` : error.property;
  for (const item of error.children) {
    if (item.children && item.children.length) {
      validationErrors.push(...mapChildrenToValidationErrors(item, parentPath));
    }
    validationErrors.push(prependConstraintsWithParentProp(parentPath, item));
  }

  return validationErrors;
}

function prependConstraintsWithParentProp(parentPath: string, error: ValidationError): ValidationError {
  const constraints: Record<string, string> = {};

  for (const key in error.constraints) {
    constraints[key] = `${parentPath}.${error.constraints[key]}`;
  }

  return { ...error, constraints };
}
