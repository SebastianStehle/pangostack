import * as https from 'https';
import { Configuration, DeploymentApi, FetchError, RequiredError, ResponseError, StatusApi } from './generated';

export class WorkerClient {
  public readonly deployment: DeploymentApi;
  public readonly status: StatusApi;

  constructor(
    public readonly basePath: string,
    public readonly apiKey: string,
  ) {
    const configuration = new Configuration({
      headers: {
        ['X-ApiKey']: apiKey,
      },
      fetchApi: async (request, init) => {
        const agent = new https.Agent({
          rejectUnauthorized: false,
        });

        let response: Response;
        try {
          response = await fetch(request as any, { ...init, agent } as any);
        } catch (error: unknown) {
          throw await buildError(error);
        }

        if (response && response.status >= 200 && response.status < 300) {
          return response;
        }

        const cause = new ResponseError(response, 'Response returned an error code');
        throw await buildError(cause);
      },
      basePath,
    });

    this.deployment = new DeploymentApi(configuration);

    this.status = new StatusApi(configuration);
  }
}

export class WorkerError<T = unknown> extends Error {
  constructor(
    public readonly status?: number,
    public readonly body?: T,
    public readonly cause?: Error,
    message?: string,
  ) {
    super(WorkerError.buildMessage(status, body, message, cause));
    Object.setPrototypeOf(this, WorkerError.prototype);
  }

  static buildMessage(statusCode?: number, body?: unknown, message?: string, cause?: Error): string {
    const lines: string[] = [];
    if (message) {
      lines.push(message);
    }

    if (statusCode) {
      lines.push(`Status: ${statusCode.toString()}`);
    }

    if (body) {
      lines.push(`Body: ${JSON.stringify(body, undefined, 2)}`);
    }

    if (cause) {
      lines.push(`Inner: ${cause}`);
    }

    return lines.join('\n');
  }
}

export class WorkerResponseError extends WorkerError {
  constructor(statusCode: number, body: any, cause?: ResponseError) {
    super(statusCode, body, cause);
    Object.setPrototypeOf(this, WorkerResponseError.prototype);
  }
}

export class WorkerRequiredFieldError extends WorkerError {
  constructor(cause?: RequiredError) {
    super(undefined, undefined, cause);
    Object.setPrototypeOf(this, WorkerRequiredFieldError.prototype);
  }
}

export async function buildError(error: unknown) {
  if (error instanceof FetchError) {
    return new WorkerError(undefined, undefined, error, error.message);
  } else if (error instanceof RequiredError) {
    return new WorkerRequiredFieldError(error);
  } else if (error instanceof ResponseError) {
    const statusCode = error.response.status;

    let body: any;
    try {
      body = await error.response.json();
    } catch {
      body = { message: 'No error details provided.', statusCode };
    }

    return new WorkerResponseError(statusCode, body, error);
  } else {
    return new WorkerResponseError(undefined, undefined, error as any);
  }
}
