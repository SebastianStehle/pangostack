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
  AddUserIpWhitelistRequest,
  CreateUserApiKeyRequest,
  CreateUserRequest,
  GetUserApiKey200Response,
  GetUserIpWhitelistEntry200Response,
  ListUserApiKeys200Response,
  ListUserIpWhitelist200Response,
  ListUsers200Response,
  RemoveUserIpWhitelistRequest,
  UpdateUserRequest,
  User,
} from '../models/index';
import {
  AddUserIpWhitelistRequestFromJSON,
  AddUserIpWhitelistRequestToJSON,
  CreateUserApiKeyRequestFromJSON,
  CreateUserApiKeyRequestToJSON,
  CreateUserRequestFromJSON,
  CreateUserRequestToJSON,
  GetUserApiKey200ResponseFromJSON,
  GetUserApiKey200ResponseToJSON,
  GetUserIpWhitelistEntry200ResponseFromJSON,
  GetUserIpWhitelistEntry200ResponseToJSON,
  ListUserApiKeys200ResponseFromJSON,
  ListUserApiKeys200ResponseToJSON,
  ListUserIpWhitelist200ResponseFromJSON,
  ListUserIpWhitelist200ResponseToJSON,
  ListUsers200ResponseFromJSON,
  ListUsers200ResponseToJSON,
  RemoveUserIpWhitelistRequestFromJSON,
  RemoveUserIpWhitelistRequestToJSON,
  UpdateUserRequestFromJSON,
  UpdateUserRequestToJSON,
  UserFromJSON,
  UserToJSON,
} from '../models/index';

export interface AddUserIpWhitelistOperationRequest {
  userId: string;
  addUserIpWhitelistRequest?: AddUserIpWhitelistRequest;
}

export interface CreateUserOperationRequest {
  createUserRequest?: CreateUserRequest;
}

export interface CreateUserApiKeyOperationRequest {
  userId: string;
  createUserApiKeyRequest?: CreateUserApiKeyRequest;
}

export interface DeleteUserRequest {
  userId: string;
}

export interface DeleteUserApiKeyRequest {
  userId: string;
  apikeyId: string;
}

export interface GetUserRequest {
  userId: string;
}

export interface GetUserApiKeyRequest {
  userId: string;
  apikeyId: string;
}

export interface GetUserIpWhitelistEntryRequest {
  userId: string;
  subnet: string;
  subnetSize: number;
}

export interface ListUserApiKeysRequest {
  userId: string;
}

export interface ListUserIpWhitelistRequest {
  userId: string;
}

export interface ListUsersRequest {
  perPage?: number;
  cursor?: string;
}

export interface RemoveUserIpWhitelistOperationRequest {
  userId: string;
  removeUserIpWhitelistRequest?: RemoveUserIpWhitelistRequest;
}

export interface UpdateUserOperationRequest {
  userId: string;
  updateUserRequest?: UpdateUserRequest;
}

/**
 *
 */
export class UsersApi extends runtime.BaseAPI {
  /**
   * Add an IP address or subnet to a User\'s whitelist. Only root users or users with manage users permission can access this endpoint.
   * Add IP to User Whitelist
   */
  async addUserIpWhitelistRaw(
    requestParameters: AddUserIpWhitelistOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['userId'] == null) {
      throw new runtime.RequiredError('userId', 'Required parameter "userId" was null or undefined when calling addUserIpWhitelist().');
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

    let urlPath = `/users/{user-id}/ip-whitelist`;
    urlPath = urlPath.replace(`{${'user-id'}}`, encodeURIComponent(String(requestParameters['userId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: AddUserIpWhitelistRequestToJSON(requestParameters['addUserIpWhitelistRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Add an IP address or subnet to a User\'s whitelist. Only root users or users with manage users permission can access this endpoint.
   * Add IP to User Whitelist
   */
  async addUserIpWhitelist(
    userId: string,
    addUserIpWhitelistRequest?: AddUserIpWhitelistRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.addUserIpWhitelistRaw({ userId: userId, addUserIpWhitelistRequest: addUserIpWhitelistRequest }, initOverrides);
  }

  /**
   * Create a new User. The `email`, `first_name`, `last_name`, and `password` attributes are required.
   * Create User
   */
  async createUserRaw(
    requestParameters: CreateUserOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<User>> {
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

    let urlPath = `/users`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateUserRequestToJSON(requestParameters['createUserRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => UserFromJSON(jsonValue));
  }

  /**
   * Create a new User. The `email`, `first_name`, `last_name`, and `password` attributes are required.
   * Create User
   */
  async createUser(createUserRequest?: CreateUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<User> {
    const response = await this.createUserRaw({ createUserRequest: createUserRequest }, initOverrides);
    return await response.value();
  }

  /**
   * Adds an API key to the target user\'s API key list. Only root users or users with manage users permission can access this endpoint.
   * Create User API Key
   */
  async createUserApiKeyRaw(
    requestParameters: CreateUserApiKeyOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['userId'] == null) {
      throw new runtime.RequiredError('userId', 'Required parameter "userId" was null or undefined when calling createUserApiKey().');
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

    let urlPath = `/users/{user-id}/apikeys`;
    urlPath = urlPath.replace(`{${'user-id'}}`, encodeURIComponent(String(requestParameters['userId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateUserApiKeyRequestToJSON(requestParameters['createUserApiKeyRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Adds an API key to the target user\'s API key list. Only root users or users with manage users permission can access this endpoint.
   * Create User API Key
   */
  async createUserApiKey(
    userId: string,
    createUserApiKeyRequest?: CreateUserApiKeyRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.createUserApiKeyRaw({ userId: userId, createUserApiKeyRequest: createUserApiKeyRequest }, initOverrides);
  }

  /**
   * Delete a User.
   * Delete User
   */
  async deleteUserRaw(
    requestParameters: DeleteUserRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['userId'] == null) {
      throw new runtime.RequiredError('userId', 'Required parameter "userId" was null or undefined when calling deleteUser().');
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

    let urlPath = `/users/{user-id}`;
    urlPath = urlPath.replace(`{${'user-id'}}`, encodeURIComponent(String(requestParameters['userId'])));

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
   * Delete a User.
   * Delete User
   */
  async deleteUser(userId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.deleteUserRaw({ userId: userId }, initOverrides);
  }

  /**
   * Delete an API key from the target user\'s API key list. Only root users or users with manage users permission can access this endpoint.
   * Delete User API Key
   */
  async deleteUserApiKeyRaw(
    requestParameters: DeleteUserApiKeyRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['userId'] == null) {
      throw new runtime.RequiredError('userId', 'Required parameter "userId" was null or undefined when calling deleteUserApiKey().');
    }

    if (requestParameters['apikeyId'] == null) {
      throw new runtime.RequiredError('apikeyId', 'Required parameter "apikeyId" was null or undefined when calling deleteUserApiKey().');
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

    let urlPath = `/users/{user-id}/apikeys/{apikey-id}`;
    urlPath = urlPath.replace(`{${'user-id'}}`, encodeURIComponent(String(requestParameters['userId'])));
    urlPath = urlPath.replace(`{${'apikey-id'}}`, encodeURIComponent(String(requestParameters['apikeyId'])));

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
   * Delete an API key from the target user\'s API key list. Only root users or users with manage users permission can access this endpoint.
   * Delete User API Key
   */
  async deleteUserApiKey(userId: string, apikeyId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.deleteUserApiKeyRaw({ userId: userId, apikeyId: apikeyId }, initOverrides);
  }

  /**
   * Get information about a User.
   * Get User
   */
  async getUserRaw(
    requestParameters: GetUserRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<User>> {
    if (requestParameters['userId'] == null) {
      throw new runtime.RequiredError('userId', 'Required parameter "userId" was null or undefined when calling getUser().');
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

    let urlPath = `/users/{user-id}`;
    urlPath = urlPath.replace(`{${'user-id'}}`, encodeURIComponent(String(requestParameters['userId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => UserFromJSON(jsonValue));
  }

  /**
   * Get information about a User.
   * Get User
   */
  async getUser(userId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<User> {
    const response = await this.getUserRaw({ userId: userId }, initOverrides);
    return await response.value();
  }

  /**
   * Gets information about a user\'s API key. API keys returned by this method are masked. Only root users or users with manage users permission can access this endpoint.
   * Get User API Key
   */
  async getUserApiKeyRaw(
    requestParameters: GetUserApiKeyRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetUserApiKey200Response>> {
    if (requestParameters['userId'] == null) {
      throw new runtime.RequiredError('userId', 'Required parameter "userId" was null or undefined when calling getUserApiKey().');
    }

    if (requestParameters['apikeyId'] == null) {
      throw new runtime.RequiredError('apikeyId', 'Required parameter "apikeyId" was null or undefined when calling getUserApiKey().');
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

    let urlPath = `/users/{user-id}/apikeys/{apikey-id}`;
    urlPath = urlPath.replace(`{${'user-id'}}`, encodeURIComponent(String(requestParameters['userId'])));
    urlPath = urlPath.replace(`{${'apikey-id'}}`, encodeURIComponent(String(requestParameters['apikeyId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetUserApiKey200ResponseFromJSON(jsonValue));
  }

  /**
   * Gets information about a user\'s API key. API keys returned by this method are masked. Only root users or users with manage users permission can access this endpoint.
   * Get User API Key
   */
  async getUserApiKey(
    userId: string,
    apikeyId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetUserApiKey200Response> {
    const response = await this.getUserApiKeyRaw({ userId: userId, apikeyId: apikeyId }, initOverrides);
    return await response.value();
  }

  /**
   * Get a specific IP whitelist entry for a User. Only root users or users with manage users permission can access this endpoint.
   * Get User IP Whitelist Entry
   */
  async getUserIpWhitelistEntryRaw(
    requestParameters: GetUserIpWhitelistEntryRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetUserIpWhitelistEntry200Response>> {
    if (requestParameters['userId'] == null) {
      throw new runtime.RequiredError(
        'userId',
        'Required parameter "userId" was null or undefined when calling getUserIpWhitelistEntry().',
      );
    }

    if (requestParameters['subnet'] == null) {
      throw new runtime.RequiredError(
        'subnet',
        'Required parameter "subnet" was null or undefined when calling getUserIpWhitelistEntry().',
      );
    }

    if (requestParameters['subnetSize'] == null) {
      throw new runtime.RequiredError(
        'subnetSize',
        'Required parameter "subnetSize" was null or undefined when calling getUserIpWhitelistEntry().',
      );
    }

    const queryParameters: any = {};

    if (requestParameters['subnet'] != null) {
      queryParameters['subnet'] = requestParameters['subnet'];
    }

    if (requestParameters['subnetSize'] != null) {
      queryParameters['subnet_size'] = requestParameters['subnetSize'];
    }

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/users/{user-id}/ip-whitelist/entry`;
    urlPath = urlPath.replace(`{${'user-id'}}`, encodeURIComponent(String(requestParameters['userId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetUserIpWhitelistEntry200ResponseFromJSON(jsonValue));
  }

  /**
   * Get a specific IP whitelist entry for a User. Only root users or users with manage users permission can access this endpoint.
   * Get User IP Whitelist Entry
   */
  async getUserIpWhitelistEntry(
    userId: string,
    subnet: string,
    subnetSize: number,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetUserIpWhitelistEntry200Response> {
    const response = await this.getUserIpWhitelistEntryRaw({ userId: userId, subnet: subnet, subnetSize: subnetSize }, initOverrides);
    return await response.value();
  }

  /**
   * Gets all API keys for the target user. API keys returned by this method are masked. Only root users or users with manage users permission can access this endpoint.
   * List User API Keys
   */
  async listUserApiKeysRaw(
    requestParameters: ListUserApiKeysRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListUserApiKeys200Response>> {
    if (requestParameters['userId'] == null) {
      throw new runtime.RequiredError('userId', 'Required parameter "userId" was null or undefined when calling listUserApiKeys().');
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

    let urlPath = `/users/{user-id}/apikeys`;
    urlPath = urlPath.replace(`{${'user-id'}}`, encodeURIComponent(String(requestParameters['userId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListUserApiKeys200ResponseFromJSON(jsonValue));
  }

  /**
   * Gets all API keys for the target user. API keys returned by this method are masked. Only root users or users with manage users permission can access this endpoint.
   * List User API Keys
   */
  async listUserApiKeys(userId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ListUserApiKeys200Response> {
    const response = await this.listUserApiKeysRaw({ userId: userId }, initOverrides);
    return await response.value();
  }

  /**
   * Get the IP whitelist for a User. Only root users or users with manage users permission can access this endpoint.
   * List User IP Whitelist
   */
  async listUserIpWhitelistRaw(
    requestParameters: ListUserIpWhitelistRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListUserIpWhitelist200Response>> {
    if (requestParameters['userId'] == null) {
      throw new runtime.RequiredError('userId', 'Required parameter "userId" was null or undefined when calling listUserIpWhitelist().');
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

    let urlPath = `/users/{user-id}/ip-whitelist`;
    urlPath = urlPath.replace(`{${'user-id'}}`, encodeURIComponent(String(requestParameters['userId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListUserIpWhitelist200ResponseFromJSON(jsonValue));
  }

  /**
   * Get the IP whitelist for a User. Only root users or users with manage users permission can access this endpoint.
   * List User IP Whitelist
   */
  async listUserIpWhitelist(
    userId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListUserIpWhitelist200Response> {
    const response = await this.listUserIpWhitelistRaw({ userId: userId }, initOverrides);
    return await response.value();
  }

  /**
   * Get a list of all Users in your account.
   * Get Users
   */
  async listUsersRaw(
    requestParameters: ListUsersRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListUsers200Response>> {
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

    let urlPath = `/users`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListUsers200ResponseFromJSON(jsonValue));
  }

  /**
   * Get a list of all Users in your account.
   * Get Users
   */
  async listUsers(
    perPage?: number,
    cursor?: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListUsers200Response> {
    const response = await this.listUsersRaw({ perPage: perPage, cursor: cursor }, initOverrides);
    return await response.value();
  }

  /**
   * Remove an IP address or subnet from a User\'s whitelist. Only root users or users with manage users permission can access this endpoint.
   * Remove IP from User Whitelist
   */
  async removeUserIpWhitelistRaw(
    requestParameters: RemoveUserIpWhitelistOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['userId'] == null) {
      throw new runtime.RequiredError('userId', 'Required parameter "userId" was null or undefined when calling removeUserIpWhitelist().');
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

    let urlPath = `/users/{user-id}/ip-whitelist`;
    urlPath = urlPath.replace(`{${'user-id'}}`, encodeURIComponent(String(requestParameters['userId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'DELETE',
        headers: headerParameters,
        query: queryParameters,
        body: RemoveUserIpWhitelistRequestToJSON(requestParameters['removeUserIpWhitelistRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Remove an IP address or subnet from a User\'s whitelist. Only root users or users with manage users permission can access this endpoint.
   * Remove IP from User Whitelist
   */
  async removeUserIpWhitelist(
    userId: string,
    removeUserIpWhitelistRequest?: RemoveUserIpWhitelistRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.removeUserIpWhitelistRaw({ userId: userId, removeUserIpWhitelistRequest: removeUserIpWhitelistRequest }, initOverrides);
  }

  /**
   * Update information for a User. All attributes are optional. If not set, the attributes will retain their original values.
   * Update User
   */
  async updateUserRaw(
    requestParameters: UpdateUserOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['userId'] == null) {
      throw new runtime.RequiredError('userId', 'Required parameter "userId" was null or undefined when calling updateUser().');
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

    let urlPath = `/users/{user-id}/ip-whitelist`;
    urlPath = urlPath.replace(`{${'user-id'}}`, encodeURIComponent(String(requestParameters['userId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PATCH',
        headers: headerParameters,
        query: queryParameters,
        body: UpdateUserRequestToJSON(requestParameters['updateUserRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Update information for a User. All attributes are optional. If not set, the attributes will retain their original values.
   * Update User
   */
  async updateUser(
    userId: string,
    updateUserRequest?: UpdateUserRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.updateUserRaw({ userId: userId, updateUserRequest: updateUserRequest }, initOverrides);
  }
}
