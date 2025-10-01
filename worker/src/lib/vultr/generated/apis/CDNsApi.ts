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
  CreatePullzone201Response,
  CreatePullzoneRequest,
  CreatePushzone201Response,
  CreatePushzoneRequest,
  CreatePushzoneUpload201Response,
  CreatePushzoneUploadRequest,
  GetPushzone200Response,
  GetPushzoneFiles200Response,
  ListPullzones200Response,
  ListPushzones200Response,
  UpdatePullzoneRequest,
  UpdatePushzoneRequest,
} from '../models/index';
import {
  CreatePullzone201ResponseFromJSON,
  CreatePullzone201ResponseToJSON,
  CreatePullzoneRequestFromJSON,
  CreatePullzoneRequestToJSON,
  CreatePushzone201ResponseFromJSON,
  CreatePushzone201ResponseToJSON,
  CreatePushzoneRequestFromJSON,
  CreatePushzoneRequestToJSON,
  CreatePushzoneUpload201ResponseFromJSON,
  CreatePushzoneUpload201ResponseToJSON,
  CreatePushzoneUploadRequestFromJSON,
  CreatePushzoneUploadRequestToJSON,
  GetPushzone200ResponseFromJSON,
  GetPushzone200ResponseToJSON,
  GetPushzoneFiles200ResponseFromJSON,
  GetPushzoneFiles200ResponseToJSON,
  ListPullzones200ResponseFromJSON,
  ListPullzones200ResponseToJSON,
  ListPushzones200ResponseFromJSON,
  ListPushzones200ResponseToJSON,
  UpdatePullzoneRequestFromJSON,
  UpdatePullzoneRequestToJSON,
  UpdatePushzoneRequestFromJSON,
  UpdatePushzoneRequestToJSON,
} from '../models/index';

export interface CreatePullzoneOperationRequest {
  createPullzoneRequest?: CreatePullzoneRequest;
}

export interface CreatePushzoneOperationRequest {
  createPushzoneRequest?: CreatePushzoneRequest;
}

export interface CreatePushzoneUploadOperationRequest {
  pushzoneId: string;
  createPushzoneUploadRequest?: CreatePushzoneUploadRequest;
}

export interface DeletePullzoneRequest {
  pullzoneId: string;
}

export interface DeletePushzoneRequest {
  pushzoneId: string;
}

export interface DeletePushzoneFileRequest {
  pushzoneId: string;
  fileName: string;
}

export interface GetPullzoneRequest {
  pullzoneId: string;
}

export interface GetPushzoneRequest {
  pushzoneId: string;
}

export interface GetPushzoneFilesRequest {
  pushzoneId: string;
}

export interface GetPushzone0Request {
  pushzoneId: string;
  fileName: string;
}

export interface PurgePullzoneRequest {
  pullzoneId: string;
}

export interface UpdatePullzoneOperationRequest {
  pullzoneId: string;
  updatePullzoneRequest?: UpdatePullzoneRequest;
}

export interface UpdatePushzoneOperationRequest {
  pushzoneId: string;
  updatePushzoneRequest?: UpdatePushzoneRequest;
}

/**
 *
 */
export class CDNsApi extends runtime.BaseAPI {
  /**
   * Create a new CDN Pull Zone.
   * Create CDN Pull Zones
   */
  async createPullzoneRaw(
    requestParameters: CreatePullzoneOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreatePullzone201Response>> {
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

    let urlPath = `/cdns/pull-zones`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreatePullzoneRequestToJSON(requestParameters['createPullzoneRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreatePullzone201ResponseFromJSON(jsonValue));
  }

  /**
   * Create a new CDN Pull Zone.
   * Create CDN Pull Zones
   */
  async createPullzone(
    createPullzoneRequest?: CreatePullzoneRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreatePullzone201Response> {
    const response = await this.createPullzoneRaw({ createPullzoneRequest: createPullzoneRequest }, initOverrides);
    return await response.value();
  }

  /**
   * Create a new CDN Push Zone.
   * Create CDN Push Zones
   */
  async createPushzoneRaw(
    requestParameters: CreatePushzoneOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreatePushzone201Response>> {
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

    let urlPath = `/cdns/push-zones`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreatePushzoneRequestToJSON(requestParameters['createPushzoneRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreatePushzone201ResponseFromJSON(jsonValue));
  }

  /**
   * Create a new CDN Push Zone.
   * Create CDN Push Zones
   */
  async createPushzone(
    createPushzoneRequest?: CreatePushzoneRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreatePushzone201Response> {
    const response = await this.createPushzoneRaw({ createPushzoneRequest: createPushzoneRequest }, initOverrides);
    return await response.value();
  }

  /**
   * Create a presigned post endpoint that can be used to upload a file to your Push Zone.  After sending this request you must send a second POST request to the returned URL. Include all of the returned inputs as form-data fields using the same key and value.  You must also include a field named \"file\" that holds the file to be uploaded.
   * Create CDN Push Zone File Upload Endpoint
   */
  async createPushzoneUploadRaw(
    requestParameters: CreatePushzoneUploadOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreatePushzoneUpload201Response>> {
    if (requestParameters['pushzoneId'] == null) {
      throw new runtime.RequiredError(
        'pushzoneId',
        'Required parameter "pushzoneId" was null or undefined when calling createPushzoneUpload().',
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

    let urlPath = `/cdns/push-zones/{pushzone-id}/files`;
    urlPath = urlPath.replace(`{${'pushzone-id'}}`, encodeURIComponent(String(requestParameters['pushzoneId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreatePushzoneUploadRequestToJSON(requestParameters['createPushzoneUploadRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreatePushzoneUpload201ResponseFromJSON(jsonValue));
  }

  /**
   * Create a presigned post endpoint that can be used to upload a file to your Push Zone.  After sending this request you must send a second POST request to the returned URL. Include all of the returned inputs as form-data fields using the same key and value.  You must also include a field named \"file\" that holds the file to be uploaded.
   * Create CDN Push Zone File Upload Endpoint
   */
  async createPushzoneUpload(
    pushzoneId: string,
    createPushzoneUploadRequest?: CreatePushzoneUploadRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreatePushzoneUpload201Response> {
    const response = await this.createPushzoneUploadRaw(
      { pushzoneId: pushzoneId, createPushzoneUploadRequest: createPushzoneUploadRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Delete a CDN Pull Zone.
   * Delete CDN Pullzone
   */
  async deletePullzoneRaw(
    requestParameters: DeletePullzoneRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['pullzoneId'] == null) {
      throw new runtime.RequiredError('pullzoneId', 'Required parameter "pullzoneId" was null or undefined when calling deletePullzone().');
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

    let urlPath = `/cdns/pull-zones/{pullzone-id}`;
    urlPath = urlPath.replace(`{${'pullzone-id'}}`, encodeURIComponent(String(requestParameters['pullzoneId'])));

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
   * Delete a CDN Pull Zone.
   * Delete CDN Pullzone
   */
  async deletePullzone(pullzoneId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.deletePullzoneRaw({ pullzoneId: pullzoneId }, initOverrides);
  }

  /**
   * Delete a CDN Push Zone.
   * Delete CDN Pushzone
   */
  async deletePushzoneRaw(
    requestParameters: DeletePushzoneRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['pushzoneId'] == null) {
      throw new runtime.RequiredError('pushzoneId', 'Required parameter "pushzoneId" was null or undefined when calling deletePushzone().');
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

    let urlPath = `/cdns/push-zones/{pushzone-id}`;
    urlPath = urlPath.replace(`{${'pushzone-id'}}`, encodeURIComponent(String(requestParameters['pushzoneId'])));

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
   * Delete a CDN Push Zone.
   * Delete CDN Pushzone
   */
  async deletePushzone(pushzoneId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.deletePushzoneRaw({ pushzoneId: pushzoneId }, initOverrides);
  }

  /**
   * Delete a CDN Push Zone file.
   * Delete CDN Pushzone File
   */
  async deletePushzoneFileRaw(
    requestParameters: DeletePushzoneFileRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['pushzoneId'] == null) {
      throw new runtime.RequiredError(
        'pushzoneId',
        'Required parameter "pushzoneId" was null or undefined when calling deletePushzoneFile().',
      );
    }

    if (requestParameters['fileName'] == null) {
      throw new runtime.RequiredError('fileName', 'Required parameter "fileName" was null or undefined when calling deletePushzoneFile().');
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

    let urlPath = `/cdns/push-zones/{pushzone-id}/files/{file-name}`;
    urlPath = urlPath.replace(`{${'pushzone-id'}}`, encodeURIComponent(String(requestParameters['pushzoneId'])));
    urlPath = urlPath.replace(`{${'file-name'}}`, encodeURIComponent(String(requestParameters['fileName'])));

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
   * Delete a CDN Push Zone file.
   * Delete CDN Pushzone File
   */
  async deletePushzoneFile(
    pushzoneId: string,
    fileName: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.deletePushzoneFileRaw({ pushzoneId: pushzoneId, fileName: fileName }, initOverrides);
  }

  /**
   * Get information about a CDN Pull Zones
   * Get CDN Pull Zone
   */
  async getPullzoneRaw(
    requestParameters: GetPullzoneRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreatePullzone201Response>> {
    if (requestParameters['pullzoneId'] == null) {
      throw new runtime.RequiredError('pullzoneId', 'Required parameter "pullzoneId" was null or undefined when calling getPullzone().');
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

    let urlPath = `/cdns/pull-zones/{pullzone-id}`;
    urlPath = urlPath.replace(`{${'pullzone-id'}}`, encodeURIComponent(String(requestParameters['pullzoneId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreatePullzone201ResponseFromJSON(jsonValue));
  }

  /**
   * Get information about a CDN Pull Zones
   * Get CDN Pull Zone
   */
  async getPullzone(pullzoneId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<CreatePullzone201Response> {
    const response = await this.getPullzoneRaw({ pullzoneId: pullzoneId }, initOverrides);
    return await response.value();
  }

  /**
   * Get information about a CDN Push Zone
   * Get CDN Push Zone
   */
  async getPushzoneRaw(
    requestParameters: GetPushzoneRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreatePushzone201Response>> {
    if (requestParameters['pushzoneId'] == null) {
      throw new runtime.RequiredError('pushzoneId', 'Required parameter "pushzoneId" was null or undefined when calling getPushzone().');
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

    let urlPath = `/cdns/push-zones/{pushzone-id}`;
    urlPath = urlPath.replace(`{${'pushzone-id'}}`, encodeURIComponent(String(requestParameters['pushzoneId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreatePushzone201ResponseFromJSON(jsonValue));
  }

  /**
   * Get information about a CDN Push Zone
   * Get CDN Push Zone
   */
  async getPushzone(pushzoneId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<CreatePushzone201Response> {
    const response = await this.getPushzoneRaw({ pushzoneId: pushzoneId }, initOverrides);
    return await response.value();
  }

  /**
   * Get a list of files that have been uploaded to a specific CDN Push Zones
   * List CDN Push Zone Files
   */
  async getPushzoneFilesRaw(
    requestParameters: GetPushzoneFilesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetPushzoneFiles200Response>> {
    if (requestParameters['pushzoneId'] == null) {
      throw new runtime.RequiredError(
        'pushzoneId',
        'Required parameter "pushzoneId" was null or undefined when calling getPushzoneFiles().',
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

    let urlPath = `/cdns/push-zones/{pushzone-id}/files`;
    urlPath = urlPath.replace(`{${'pushzone-id'}}`, encodeURIComponent(String(requestParameters['pushzoneId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetPushzoneFiles200ResponseFromJSON(jsonValue));
  }

  /**
   * Get a list of files that have been uploaded to a specific CDN Push Zones
   * List CDN Push Zone Files
   */
  async getPushzoneFiles(
    pushzoneId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetPushzoneFiles200Response> {
    const response = await this.getPushzoneFilesRaw({ pushzoneId: pushzoneId }, initOverrides);
    return await response.value();
  }

  /**
   * Get information about a CDN Push Zone file
   * Get CDN Push Zone File
   */
  async getPushzone_1Raw(
    requestParameters: GetPushzone0Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetPushzone200Response>> {
    if (requestParameters['pushzoneId'] == null) {
      throw new runtime.RequiredError('pushzoneId', 'Required parameter "pushzoneId" was null or undefined when calling getPushzone_1().');
    }

    if (requestParameters['fileName'] == null) {
      throw new runtime.RequiredError('fileName', 'Required parameter "fileName" was null or undefined when calling getPushzone_1().');
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

    let urlPath = `/cdns/push-zones/{pushzone-id}/files/{file-name}`;
    urlPath = urlPath.replace(`{${'pushzone-id'}}`, encodeURIComponent(String(requestParameters['pushzoneId'])));
    urlPath = urlPath.replace(`{${'file-name'}}`, encodeURIComponent(String(requestParameters['fileName'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetPushzone200ResponseFromJSON(jsonValue));
  }

  /**
   * Get information about a CDN Push Zone file
   * Get CDN Push Zone File
   */
  async getPushzone_1(
    pushzoneId: string,
    fileName: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetPushzone200Response> {
    const response = await this.getPushzone_1Raw({ pushzoneId: pushzoneId, fileName: fileName }, initOverrides);
    return await response.value();
  }

  /**
   * List CDN Pull Zones
   * List CDN Pull Zones
   */
  async listPullzonesRaw(
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListPullzones200Response>> {
    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/cdns/pull-zones`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListPullzones200ResponseFromJSON(jsonValue));
  }

  /**
   * List CDN Pull Zones
   * List CDN Pull Zones
   */
  async listPullzones(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ListPullzones200Response> {
    const response = await this.listPullzonesRaw(initOverrides);
    return await response.value();
  }

  /**
   * List CDN Push Zones
   * List CDN Push Zones
   */
  async listPushzonesRaw(
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListPushzones200Response>> {
    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/cdns/push-zones`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListPushzones200ResponseFromJSON(jsonValue));
  }

  /**
   * List CDN Push Zones
   * List CDN Push Zones
   */
  async listPushzones(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ListPushzones200Response> {
    const response = await this.listPushzonesRaw(initOverrides);
    return await response.value();
  }

  /**
   * Clears cached content on server proxies so that visitors can get the latest page versions.  **Note:** This action may only be performed once every six hours.  **Note:** This action may take a few extra seconds to complete.
   * Purge CDN Pull Zone
   */
  async purgePullzoneRaw(
    requestParameters: PurgePullzoneRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<Array<string>>> {
    if (requestParameters['pullzoneId'] == null) {
      throw new runtime.RequiredError('pullzoneId', 'Required parameter "pullzoneId" was null or undefined when calling purgePullzone().');
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

    let urlPath = `/cdns/pull-zones/{pullzone-id}/purge`;
    urlPath = urlPath.replace(`{${'pullzone-id'}}`, encodeURIComponent(String(requestParameters['pullzoneId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse<any>(response);
  }

  /**
   * Clears cached content on server proxies so that visitors can get the latest page versions.  **Note:** This action may only be performed once every six hours.  **Note:** This action may take a few extra seconds to complete.
   * Purge CDN Pull Zone
   */
  async purgePullzone(pullzoneId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<string>> {
    const response = await this.purgePullzoneRaw({ pullzoneId: pullzoneId }, initOverrides);
    return await response.value();
  }

  /**
   * Update information for a CDN Pullzone. All attributes are optional. If not set, the attributes will retain their original values.
   * Update CDN Pull Zone
   */
  async updatePullzoneRaw(
    requestParameters: UpdatePullzoneOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreatePullzone201Response>> {
    if (requestParameters['pullzoneId'] == null) {
      throw new runtime.RequiredError('pullzoneId', 'Required parameter "pullzoneId" was null or undefined when calling updatePullzone().');
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

    let urlPath = `/cdns/pull-zones/{pullzone-id}`;
    urlPath = urlPath.replace(`{${'pullzone-id'}}`, encodeURIComponent(String(requestParameters['pullzoneId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: UpdatePullzoneRequestToJSON(requestParameters['updatePullzoneRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreatePullzone201ResponseFromJSON(jsonValue));
  }

  /**
   * Update information for a CDN Pullzone. All attributes are optional. If not set, the attributes will retain their original values.
   * Update CDN Pull Zone
   */
  async updatePullzone(
    pullzoneId: string,
    updatePullzoneRequest?: UpdatePullzoneRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreatePullzone201Response> {
    const response = await this.updatePullzoneRaw({ pullzoneId: pullzoneId, updatePullzoneRequest: updatePullzoneRequest }, initOverrides);
    return await response.value();
  }

  /**
   * Update information for a CDN Pushzone. All attributes are optional. If not set, the attributes will retain their original values.
   * Update CDN Push Zone
   */
  async updatePushzoneRaw(
    requestParameters: UpdatePushzoneOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreatePushzone201Response>> {
    if (requestParameters['pushzoneId'] == null) {
      throw new runtime.RequiredError('pushzoneId', 'Required parameter "pushzoneId" was null or undefined when calling updatePushzone().');
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

    let urlPath = `/cdns/push-zones/{pushzone-id}`;
    urlPath = urlPath.replace(`{${'pushzone-id'}}`, encodeURIComponent(String(requestParameters['pushzoneId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: UpdatePushzoneRequestToJSON(requestParameters['updatePushzoneRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreatePushzone201ResponseFromJSON(jsonValue));
  }

  /**
   * Update information for a CDN Pushzone. All attributes are optional. If not set, the attributes will retain their original values.
   * Update CDN Push Zone
   */
  async updatePushzone(
    pushzoneId: string,
    updatePushzoneRequest?: UpdatePushzoneRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreatePushzone201Response> {
    const response = await this.updatePushzoneRaw({ pushzoneId: pushzoneId, updatePushzoneRequest: updatePushzoneRequest }, initOverrides);
    return await response.value();
  }
}
