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

import * as runtime from '../runtime';
import type {
  CreateStartupScriptRequest,
  GetStartupScript200Response,
  ListStartupScripts200Response,
  UpdateStartupScriptRequest,
} from '../models/index';
import {
  CreateStartupScriptRequestFromJSON,
  CreateStartupScriptRequestToJSON,
  GetStartupScript200ResponseFromJSON,
  GetStartupScript200ResponseToJSON,
  ListStartupScripts200ResponseFromJSON,
  ListStartupScripts200ResponseToJSON,
  UpdateStartupScriptRequestFromJSON,
  UpdateStartupScriptRequestToJSON,
} from '../models/index';

export interface CreateStartupScriptOperationRequest {
  createStartupScriptRequest?: CreateStartupScriptRequest;
}

export interface DeleteStartupScriptRequest {
  startupId: string;
}

export interface GetStartupScriptRequest {
  startupId: string;
}

export interface ListStartupScriptsRequest {
  perPage?: number;
  cursor?: string;
}

export interface UpdateStartupScriptOperationRequest {
  startupId: string;
  updateStartupScriptRequest?: UpdateStartupScriptRequest;
}

/**
 *
 */
export class StartupApi extends runtime.BaseAPI {
  /**
   * Create a new Startup Script. The `name` and `script` attributes are required, and scripts are base-64 encoded.
   * Create Startup Script
   */
  async createStartupScriptRaw(
    requestParameters: CreateStartupScriptOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetStartupScript200Response>> {
    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/startup-scripts`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateStartupScriptRequestToJSON(requestParameters['createStartupScriptRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetStartupScript200ResponseFromJSON(jsonValue));
  }

  /**
   * Create a new Startup Script. The `name` and `script` attributes are required, and scripts are base-64 encoded.
   * Create Startup Script
   */
  async createStartupScript(
    createStartupScriptRequest?: CreateStartupScriptRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetStartupScript200Response> {
    const response = await this.createStartupScriptRaw({ createStartupScriptRequest: createStartupScriptRequest }, initOverrides);
    return await response.value();
  }

  /**
   * Delete a Startup Script.
   * Delete Startup Script
   */
  async deleteStartupScriptRaw(
    requestParameters: DeleteStartupScriptRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['startupId'] == null) {
      throw new runtime.RequiredError(
        'startupId',
        'Required parameter "startupId" was null or undefined when calling deleteStartupScript().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/startup-scripts/{startup-id}`;
    urlPath = urlPath.replace(`{${'startup-id'}}`, encodeURIComponent(String(requestParameters['startupId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'DELETE',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Delete a Startup Script.
   * Delete Startup Script
   */
  async deleteStartupScript(startupId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.deleteStartupScriptRaw({ startupId: startupId }, initOverrides);
  }

  /**
   * Get information for a Startup Script.
   * Get Startup Script
   */
  async getStartupScriptRaw(
    requestParameters: GetStartupScriptRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetStartupScript200Response>> {
    if (requestParameters['startupId'] == null) {
      throw new runtime.RequiredError('startupId', 'Required parameter "startupId" was null or undefined when calling getStartupScript().');
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/startup-scripts/{startup-id}`;
    urlPath = urlPath.replace(`{${'startup-id'}}`, encodeURIComponent(String(requestParameters['startupId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetStartupScript200ResponseFromJSON(jsonValue));
  }

  /**
   * Get information for a Startup Script.
   * Get Startup Script
   */
  async getStartupScript(
    startupId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetStartupScript200Response> {
    const response = await this.getStartupScriptRaw({ startupId: startupId }, initOverrides);
    return await response.value();
  }

  /**
   * Get a list of all Startup Scripts.
   * List Startup Scripts
   */
  async listStartupScriptsRaw(
    requestParameters: ListStartupScriptsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListStartupScripts200Response>> {
    const queryParameters: any = {};

    if (requestParameters['perPage'] != null) {
      queryParameters['per_page'] = requestParameters['perPage'];
    }

    if (requestParameters['cursor'] != null) {
      queryParameters['cursor'] = requestParameters['cursor'];
    }

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/startup-scripts`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListStartupScripts200ResponseFromJSON(jsonValue));
  }

  /**
   * Get a list of all Startup Scripts.
   * List Startup Scripts
   */
  async listStartupScripts(
    perPage?: number,
    cursor?: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListStartupScripts200Response> {
    const response = await this.listStartupScriptsRaw({ perPage: perPage, cursor: cursor }, initOverrides);
    return await response.value();
  }

  /**
   * Update a Startup Script. The attributes `name` and `script` are optional. If not set, the attributes will retain their original values. The `script` attribute is base-64 encoded. New deployments will use the updated script, but this action does not update previously deployed instances.
   * Update Startup Script
   */
  async updateStartupScriptRaw(
    requestParameters: UpdateStartupScriptOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['startupId'] == null) {
      throw new runtime.RequiredError(
        'startupId',
        'Required parameter "startupId" was null or undefined when calling updateStartupScript().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/startup-scripts/{startup-id}`;
    urlPath = urlPath.replace(`{${'startup-id'}}`, encodeURIComponent(String(requestParameters['startupId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PATCH',
        headers: headerParameters,
        query: queryParameters,
        body: UpdateStartupScriptRequestToJSON(requestParameters['updateStartupScriptRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Update a Startup Script. The attributes `name` and `script` are optional. If not set, the attributes will retain their original values. The `script` attribute is base-64 encoded. New deployments will use the updated script, but this action does not update previously deployed instances.
   * Update Startup Script
   */
  async updateStartupScript(
    startupId: string,
    updateStartupScriptRequest?: UpdateStartupScriptRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.updateStartupScriptRaw({ startupId: startupId, updateStartupScriptRequest: updateStartupScriptRequest }, initOverrides);
  }
}
