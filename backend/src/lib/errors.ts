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
