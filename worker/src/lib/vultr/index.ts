import * as https from 'https';
import { Configuration, FetchError, InstancesApi, RequiredError, ResponseError, S3Api } from './generated';

export class WorkerClient {
  public readonly objectStorages: S3Api;
  public readonly instances: InstancesApi;

  constructor(
    public readonly basePath: string,
    public readonly apiKey?: string,
  ) {
    const configuration = new Configuration({
      headers: {
        ['Authorization']: `Bearer ${apiKey}`,
      },
      fetchApi: async (request, init) => {
        const agent = new https.Agent({
          rejectUnauthorized: false,
        });

        let response: Response;
        try {
          response = await fetch(request as any, { ...init, agent } as any);
        } catch (ex) {
          throw await buildError(ex);
        }

        if (response && response.status >= 200 && response.status < 300) {
          return response;
        }

        const cause = new ResponseError(response, 'Response returned an error code');
        throw await buildError(cause);
      },
      basePath,
    });

    this.objectStorages = new S3Api(configuration);
    this.instances = new InstancesApi(configuration);
  }
}

export class WorkerError<T = unknown> {
  public readonly message: string;

  constructor(
    public readonly status?: number,
    public readonly body?: T,
    public readonly cause?: Error,
    message?: string,
  ) {
    this.message = WorkerError.buildMessage(status, body, message ?? cause?.message, cause);
  }

  static buildMessage(statusCode?: number, body?: unknown, message?: string, cause?: Error): string {
    const lines: string[] = [];

    if (message) {
      lines.push(message);
    }

    if (statusCode !== undefined) {
      lines.push(`Status: ${statusCode}`);
    }

    if (body !== undefined) {
      try {
        lines.push(`Body: ${JSON.stringify(body, null, 2)}`);
      } catch {
        lines.push(`Body: [unserializable]`);
      }
    }

    if (cause) {
      lines.push(`Inner: ${String(cause)}`);
    }

    return lines.length > 0 ? lines.join('\n') : 'WorkerError occurred';
  }
}

export class WorkerResponseError<T = unknown> extends WorkerError<T> {
  constructor(statusCode: number, body: T, cause?: ResponseError) {
    super(statusCode, body, cause, cause?.message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class WorkerRequiredFieldError extends WorkerError {
  constructor(cause?: RequiredError) {
    super(undefined, undefined, cause, cause?.message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export async function buildError(error: unknown): Promise<WorkerError> {
  if (error instanceof RequiredError) {
    return new WorkerRequiredFieldError(error);
  }

  if (error instanceof FetchError) {
    return new WorkerError(undefined, undefined, error, error.message);
  }

  if (error instanceof ResponseError) {
    const statusCode = error.response.status;
    let body: unknown;

    try {
      body = await error.response.json();
    } catch {
      body = { message: 'No error details provided.', statusCode };
    }

    return new WorkerResponseError(statusCode, body, error);
  }

  return new WorkerError(undefined, undefined, error as Error, 'Unknown error occurred');
}
