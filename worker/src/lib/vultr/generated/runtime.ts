/* eslint-disable */
// @ts-nocheck
/* tslint:disable */
/* eslint-disable */
/**
 * Vultr API
 * # Introduction  The Vultr API v2 is a set of HTTP endpoints that adhere to RESTful design principles and CRUD actions with predictable URIs. It uses standard HTTP response codes, authentication, and verbs. The API has consistent and well-formed JSON requests and responses with cursor-based pagination to simplify list handling. Error messages are descriptive and easy to understand. All functions of the Vultr customer portal are accessible via the API, enabling you to script complex unattended scenarios with any tool fluent in HTTP.  ## Requests  Communicate with the API by making an HTTP request at the correct endpoint. The chosen method determines the action taken.  | Method | Usage | | ------ | ------------- | | DELETE | Use the DELETE method to destroy a resource in your account. If it is not found, the operation will return a 4xx error and an appropriate message. | | GET | To retrieve information about a resource, use the GET method. The data is returned as a JSON object. GET methods are read-only and do not affect any resources. | | PATCH | Some resources support partial modification with PATCH, which modifies specific attributes without updating the entire object representation. | | POST | Issue a POST method to create a new object. Include all needed attributes in the request body encoded as JSON. | | PUT | Use the PUT method to update information about a resource. PUT will set new values on the item without regard to their current values. |  **Rate Limit:** Vultr safeguards the API against bursts of incoming traffic based on the request\'s IP address to ensure stability for all users. If your application sends more than 30 requests per second, the API may return HTTP status code 429.  ## Response Codes  We use standard HTTP response codes to show the success or failure of requests. Response codes in the 2xx range indicate success, while codes in the 4xx range indicate an error, such as an authorization failure or a malformed request. All 4xx errors will return a JSON response object with an `error` attribute explaining the error. Codes in the 5xx range indicate a server-side problem preventing Vultr from fulfilling your request.  | Response | Description | | ------ | ------------- | | 200 OK | The response contains your requested information. | | 201 Created | Your request was accepted. The resource was created. | | 202 Accepted | Your request was accepted. The resource was created or updated. | | 204 No Content | Your request succeeded, there is no additional information returned. | | 400 Bad Request | Your request was malformed. | | 401 Unauthorized | You did not supply valid authentication credentials. | | 403 Forbidden | You are not allowed to perform that action. | | 404 Not Found | No results were found for your request. | | 429 Too Many Requests | Your request exceeded the API rate limit. | | 500 Internal Server Error | We were unable to perform the request due to server-side problems. |  ## Meta and Pagination  Many API calls will return a `meta` object with paging information.  ### Definitions  | Term | Description | | ------ | ------------- | | **List** | The items returned from the database for your request (not necessarily shown in a single response depending on the **cursor** size). | | **Page** | A subset of the full **list** of items. Choose the size of a **page** with the `per_page` parameter. | | **Total** | The `total` attribute indicates the number of items in the full **list**.| | **Cursor** | Use the `cursor` query parameter to select a next or previous **page**. | | **Next** & **Prev** | Use the `next` and `prev` attributes of the `links` meta object as `cursor` values. |  ### How to use Paging  If your result **list** total exceeds the default **cursor** size (the default depends on the route, but is usually 100 records) or the value defined by the `per_page` query param (when present) the response will be returned to you paginated.  ### Paging Example  > These examples have abbreviated attributes and sample values. Your actual `cursor` values will be encoded alphanumeric strings.  To return a **page** with the first two plans in the List:      curl \"https://api.vultr.com/v2/plans?per_page=2\" \\       -X GET \\       -H \"Authorization: Bearer ${VULTR_API_KEY}\"  The API returns an object similar to this:      {         \"plans\": [             {                 \"id\": \"vc2-1c-2gb\",                 \"vcpu_count\": 1,                 \"ram\": 2048,                 \"locations\": []             },             {                 \"id\": \"vc2-24c-97gb\",                 \"vcpu_count\": 24,                 \"ram\": 98304,                 \"locations\": []             }         ],         \"meta\": {             \"total\": 19,             \"links\": {                 \"next\": \"WxYzExampleNext\",                 \"prev\": \"WxYzExamplePrev\"             }         }     }  The object contains two plans. The `total` attribute indicates that 19 plans are available in the List. To navigate forward in the **list**, use the `next` value (`WxYzExampleNext` in this example) as your `cursor` query parameter.      curl \"https://api.vultr.com/v2/plans?per_page=2&cursor=WxYzExampleNext\" \\       -X GET       -H \"Authorization: Bearer ${VULTR_API_KEY}\"  Likewise, you can use the example `prev` value `WxYzExamplePrev` to navigate backward.  ## Parameters  You can pass information to the API with three different types of parameters.  ### Path parameters  Some API calls require variable parameters as part of the endpoint path. For example, to retrieve information about a user, supply the `user-id` in the endpoint.      curl \"https://api.vultr.com/v2/users/{user-id}\" \\       -X GET \\       -H \"Authorization: Bearer ${VULTR_API_KEY}\"  ### Query parameters  Some API calls allow filtering with query parameters. For example, the `/v2/plans` endpoint supports a `type` query parameter. Setting `type=vhf` instructs the API only to return High Frequency Compute plans in the list. You\'ll find more specifics about valid filters in the endpoint documentation below.      curl \"https://api.vultr.com/v2/plans?type=vhf\" \\       -X GET \\       -H \"Authorization: Bearer ${VULTR_API_KEY}\"  You can also combine filtering with paging. Use the `per_page` parameter to retreive a subset of vhf plans.      curl \"https://api.vultr.com/v2/plans?type=vhf&per_page=2\" \\       -X GET \\       -H \"Authorization: Bearer ${VULTR_API_KEY}\"  ### Request Body  PUT, POST, and PATCH methods may include an object in the request body with a content type of **application/json**. The documentation for each endpoint below has more information about the expected object.  ## API Example Conventions  The examples in this documentation use `curl`, a command-line HTTP client, to demonstrate useage. Linux and macOS computers usually have curl installed by default, and it\'s [available for download](https://curl.se/download.html) on all popular platforms including Windows.  Each example is split across multiple lines with the `\\` character, which is compatible with a `bash` terminal. A typical example looks like this:      curl \"https://api.vultr.com/v2/domains\" \\       -X POST \\       -H \"Authorization: Bearer ${VULTR_API_KEY}\" \\       -H \"Content-Type: application/json\" \\       --data \'{         \"domain\" : \"example.com\",         \"ip\" : \"192.0.2.123\"       }\'  * The `-X` parameter sets the request method. For consistency, we show the method on all examples, even though it\'s not explicitly required for GET methods. * The `-H` lines set required HTTP headers. These examples are formatted to expand the VULTR\\_API\\_KEY environment variable for your convenience. * Examples that require a JSON object in the request body pass the required data via the `--data` parameter.  All values in this guide are examples. Do not rely on the OS or Plan IDs listed in this guide; use the appropriate endpoint to retreive values before creating resources.
 *
 * The version of the OpenAPI document: 2.0
 * Contact: support@vultr.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

export const BASE_PATH = 'https://api.vultr.com/v2'.replace(/\/+$/, '');

export interface ConfigurationParameters {
  basePath?: string; // override base path
  fetchApi?: FetchAPI; // override for fetch implementation
  middleware?: Middleware[]; // middleware to apply before/after fetch requests
  queryParamsStringify?: (params: HTTPQuery) => string; // stringify function for query strings
  username?: string; // parameter for basic security
  password?: string; // parameter for basic security
  apiKey?: string | Promise<string> | ((name: string) => string | Promise<string>); // parameter for apiKey security
  accessToken?: string | Promise<string> | ((name?: string, scopes?: string[]) => string | Promise<string>); // parameter for oauth2 security
  headers?: HTTPHeaders; //header params we want to use on every request
  credentials?: RequestCredentials; //value for the credentials param we want to use on each request
}

export class Configuration {
  constructor(private configuration: ConfigurationParameters = {}) {}

  set config(configuration: Configuration) {
    this.configuration = configuration;
  }

  get basePath(): string {
    return this.configuration.basePath != null ? this.configuration.basePath : BASE_PATH;
  }

  get fetchApi(): FetchAPI | undefined {
    return this.configuration.fetchApi;
  }

  get middleware(): Middleware[] {
    return this.configuration.middleware || [];
  }

  get queryParamsStringify(): (params: HTTPQuery) => string {
    return this.configuration.queryParamsStringify || querystring;
  }

  get username(): string | undefined {
    return this.configuration.username;
  }

  get password(): string | undefined {
    return this.configuration.password;
  }

  get apiKey(): ((name: string) => string | Promise<string>) | undefined {
    const apiKey = this.configuration.apiKey;
    if (apiKey) {
      return typeof apiKey === 'function' ? apiKey : () => apiKey;
    }
    return undefined;
  }

  get accessToken(): ((name?: string, scopes?: string[]) => string | Promise<string>) | undefined {
    const accessToken = this.configuration.accessToken;
    if (accessToken) {
      return typeof accessToken === 'function' ? accessToken : async () => accessToken;
    }
    return undefined;
  }

  get headers(): HTTPHeaders | undefined {
    return this.configuration.headers;
  }

  get credentials(): RequestCredentials | undefined {
    return this.configuration.credentials;
  }
}

export const DefaultConfig = new Configuration();

/**
 * This is the base class for all generated API classes.
 */
export class BaseAPI {
  private static readonly jsonRegex = new RegExp('^(:?application\/json|[^;/ \t]+\/[^;/ \t]+[+]json)[ \t]*(:?;.*)?$', 'i');
  private middleware: Middleware[];

  constructor(protected configuration = DefaultConfig) {
    this.middleware = configuration.middleware;
  }

  withMiddleware<T extends BaseAPI>(this: T, ...middlewares: Middleware[]) {
    const next = this.clone<T>();
    next.middleware = next.middleware.concat(...middlewares);
    return next;
  }

  withPreMiddleware<T extends BaseAPI>(this: T, ...preMiddlewares: Array<Middleware['pre']>) {
    const middlewares = preMiddlewares.map((pre) => ({ pre }));
    return this.withMiddleware<T>(...middlewares);
  }

  withPostMiddleware<T extends BaseAPI>(this: T, ...postMiddlewares: Array<Middleware['post']>) {
    const middlewares = postMiddlewares.map((post) => ({ post }));
    return this.withMiddleware<T>(...middlewares);
  }

  /**
   * Check if the given MIME is a JSON MIME.
   * JSON MIME examples:
   *   application/json
   *   application/json; charset=UTF8
   *   APPLICATION/JSON
   *   application/vnd.company+json
   * @param mime - MIME (Multipurpose Internet Mail Extensions)
   * @return True if the given MIME is JSON, false otherwise.
   */
  protected isJsonMime(mime: string | null | undefined): boolean {
    if (!mime) {
      return false;
    }
    return BaseAPI.jsonRegex.test(mime);
  }

  protected async request(context: RequestOpts, initOverrides?: RequestInit | InitOverrideFunction): Promise<Response> {
    const { url, init } = await this.createFetchParams(context, initOverrides);
    const response = await this.fetchApi(url, init);
    if (response && response.status >= 200 && response.status < 300) {
      return response;
    }
    throw new ResponseError(response, 'Response returned an error code');
  }

  private async createFetchParams(context: RequestOpts, initOverrides?: RequestInit | InitOverrideFunction) {
    let url = this.configuration.basePath + context.path;
    if (context.query !== undefined && Object.keys(context.query).length !== 0) {
      // only add the querystring to the URL if there are query parameters.
      // this is done to avoid urls ending with a "?" character which buggy webservers
      // do not handle correctly sometimes.
      url += '?' + this.configuration.queryParamsStringify(context.query);
    }

    const headers = Object.assign({}, this.configuration.headers, context.headers);
    Object.keys(headers).forEach((key) => (headers[key] === undefined ? delete headers[key] : {}));

    const initOverrideFn = typeof initOverrides === 'function' ? initOverrides : async () => initOverrides;

    const initParams = {
      method: context.method,
      headers,
      body: context.body,
      credentials: this.configuration.credentials,
    };

    const overriddenInit: RequestInit = {
      ...initParams,
      ...(await initOverrideFn({
        init: initParams,
        context,
      })),
    };

    let body: any;
    if (isFormData(overriddenInit.body) || overriddenInit.body instanceof URLSearchParams || isBlob(overriddenInit.body)) {
      body = overriddenInit.body;
    } else if (this.isJsonMime(headers['Content-Type'])) {
      body = JSON.stringify(overriddenInit.body);
    } else {
      body = overriddenInit.body;
    }

    const init: RequestInit = {
      ...overriddenInit,
      body,
    };

    return { url, init };
  }

  private fetchApi = async (url: string, init: RequestInit) => {
    let fetchParams = { url, init };
    for (const middleware of this.middleware) {
      if (middleware.pre) {
        fetchParams =
          (await middleware.pre({
            fetch: this.fetchApi,
            ...fetchParams,
          })) || fetchParams;
      }
    }
    let response: Response | undefined = undefined;
    try {
      response = await (this.configuration.fetchApi || fetch)(fetchParams.url, fetchParams.init);
    } catch (e) {
      for (const middleware of this.middleware) {
        if (middleware.onError) {
          response =
            (await middleware.onError({
              fetch: this.fetchApi,
              url: fetchParams.url,
              init: fetchParams.init,
              error: e,
              response: response ? response.clone() : undefined,
            })) || response;
        }
      }
      if (response === undefined) {
        if (e instanceof Error) {
          throw new FetchError(e, 'The request failed and the interceptors did not return an alternative response');
        } else {
          throw e;
        }
      }
    }
    for (const middleware of this.middleware) {
      if (middleware.post) {
        response =
          (await middleware.post({
            fetch: this.fetchApi,
            url: fetchParams.url,
            init: fetchParams.init,
            response: response.clone(),
          })) || response;
      }
    }
    return response;
  };

  /**
   * Create a shallow clone of `this` by constructing a new instance
   * and then shallow cloning data members.
   */
  private clone<T extends BaseAPI>(this: T): T {
    const constructor = this.constructor as any;
    const next = new constructor(this.configuration);
    next.middleware = this.middleware.slice();
    return next;
  }
}

function isBlob(value: any): value is Blob {
  return typeof Blob !== 'undefined' && value instanceof Blob;
}

function isFormData(value: any): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

export class ResponseError extends Error {
  override name: 'ResponseError' = 'ResponseError';
  constructor(
    public response: Response,
    msg?: string,
  ) {
    super(msg);
  }
}

export class FetchError extends Error {
  override name: 'FetchError' = 'FetchError';
  constructor(
    public cause: Error,
    msg?: string,
  ) {
    super(msg);
  }
}

export class RequiredError extends Error {
  override name: 'RequiredError' = 'RequiredError';
  constructor(
    public field: string,
    msg?: string,
  ) {
    super(msg);
  }
}

export const COLLECTION_FORMATS = {
  csv: ',',
  ssv: ' ',
  tsv: '\t',
  pipes: '|',
};

export type FetchAPI = WindowOrWorkerGlobalScope['fetch'];

export type Json = any;
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
export type HTTPHeaders = { [key: string]: string };
export type HTTPQuery = {
  [key: string]:
    | string
    | number
    | null
    | boolean
    | Array<string | number | null | boolean>
    | Set<string | number | null | boolean>
    | HTTPQuery;
};
export type HTTPBody = Json | FormData | URLSearchParams;
export type HTTPRequestInit = { headers?: HTTPHeaders; method: HTTPMethod; credentials?: RequestCredentials; body?: HTTPBody };
export type ModelPropertyNaming = 'camelCase' | 'snake_case' | 'PascalCase' | 'original';

export type InitOverrideFunction = (requestContext: { init: HTTPRequestInit; context: RequestOpts }) => Promise<RequestInit>;

export interface FetchParams {
  url: string;
  init: RequestInit;
}

export interface RequestOpts {
  path: string;
  method: HTTPMethod;
  headers: HTTPHeaders;
  query?: HTTPQuery;
  body?: HTTPBody;
}

export function querystring(params: HTTPQuery, prefix: string = ''): string {
  return Object.keys(params)
    .map((key) => querystringSingleKey(key, params[key], prefix))
    .filter((part) => part.length > 0)
    .join('&');
}

function querystringSingleKey(
  key: string,
  value:
    | string
    | number
    | null
    | undefined
    | boolean
    | Array<string | number | null | boolean>
    | Set<string | number | null | boolean>
    | HTTPQuery,
  keyPrefix: string = '',
): string {
  const fullKey = keyPrefix + (keyPrefix.length ? `[${key}]` : key);
  if (value instanceof Array) {
    const multiValue = value.map((singleValue) => encodeURIComponent(String(singleValue))).join(`&${encodeURIComponent(fullKey)}=`);
    return `${encodeURIComponent(fullKey)}=${multiValue}`;
  }
  if (value instanceof Set) {
    const valueAsArray = Array.from(value);
    return querystringSingleKey(key, valueAsArray, keyPrefix);
  }
  if (value instanceof Date) {
    return `${encodeURIComponent(fullKey)}=${encodeURIComponent(value.toISOString())}`;
  }
  if (value instanceof Object) {
    return querystring(value as HTTPQuery, fullKey);
  }
  return `${encodeURIComponent(fullKey)}=${encodeURIComponent(String(value))}`;
}

export function exists(json: any, key: string) {
  const value = json[key];
  return value !== null && value !== undefined;
}

export function mapValues(data: any, fn: (item: any) => any) {
  const result: { [key: string]: any } = {};
  for (const key of Object.keys(data)) {
    result[key] = fn(data[key]);
  }
  return result;
}

export function canConsumeForm(consumes: Consume[]): boolean {
  for (const consume of consumes) {
    if ('multipart/form-data' === consume.contentType) {
      return true;
    }
  }
  return false;
}

export interface Consume {
  contentType: string;
}

export interface RequestContext {
  fetch: FetchAPI;
  url: string;
  init: RequestInit;
}

export interface ResponseContext {
  fetch: FetchAPI;
  url: string;
  init: RequestInit;
  response: Response;
}

export interface ErrorContext {
  fetch: FetchAPI;
  url: string;
  init: RequestInit;
  error: unknown;
  response?: Response;
}

export interface Middleware {
  pre?(context: RequestContext): Promise<FetchParams | void>;
  post?(context: ResponseContext): Promise<Response | void>;
  onError?(context: ErrorContext): Promise<Response | void>;
}

export interface ApiResponse<T> {
  raw: Response;
  value(): Promise<T>;
}

export interface ResponseTransformer<T> {
  (json: any): T;
}

export class JSONApiResponse<T> {
  constructor(
    public raw: Response,
    private transformer: ResponseTransformer<T> = (jsonValue: any) => jsonValue,
  ) {}

  async value(): Promise<T> {
    return this.transformer(await this.raw.json());
  }
}

export class VoidApiResponse {
  constructor(public raw: Response) {}

  async value(): Promise<void> {
    return undefined;
  }
}

export class BlobApiResponse {
  constructor(public raw: Response) {}

  async value(): Promise<Blob> {
    return await this.raw.blob();
  }
}

export class TextApiResponse {
  constructor(public raw: Response) {}

  async value(): Promise<string> {
    return await this.raw.text();
  }
}
