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
  AttachBaremetalsVpc2Request,
  AttachBaremetalsVpcsRequest,
  CreateBaremetal202Response,
  CreateBaremetalRequest,
  CreateBaremetalReverseIpv4Request,
  CreateBaremetalReverseIpv6Request,
  DetachBaremetalVpc2Request,
  DetachBaremetalVpcsRequest,
  GetBandwidthBaremetal200Response,
  GetBareMetalUserdata200Response,
  GetBareMetalVnc200Response,
  GetBareMetalsUpgrades200Response,
  GetBaremetal200Response,
  GetIpv4Baremetal200Response,
  GetIpv6Baremetal200Response,
  HaltBaremetalsRequest,
  ListBaremetalVpc2200Response,
  ListBaremetalVpcs200Response,
  ListBaremetals200Response,
  PostBaremetalInstanceIdIpv4ReverseDefaultRequest,
  ReinstallBaremetalRequest,
  UpdateBaremetal202Response,
  UpdateBaremetalRequest,
} from '../models/index';
import {
  AttachBaremetalsVpc2RequestFromJSON,
  AttachBaremetalsVpc2RequestToJSON,
  AttachBaremetalsVpcsRequestFromJSON,
  AttachBaremetalsVpcsRequestToJSON,
  CreateBaremetal202ResponseFromJSON,
  CreateBaremetal202ResponseToJSON,
  CreateBaremetalRequestFromJSON,
  CreateBaremetalRequestToJSON,
  CreateBaremetalReverseIpv4RequestFromJSON,
  CreateBaremetalReverseIpv4RequestToJSON,
  CreateBaremetalReverseIpv6RequestFromJSON,
  CreateBaremetalReverseIpv6RequestToJSON,
  DetachBaremetalVpc2RequestFromJSON,
  DetachBaremetalVpc2RequestToJSON,
  DetachBaremetalVpcsRequestFromJSON,
  DetachBaremetalVpcsRequestToJSON,
  GetBandwidthBaremetal200ResponseFromJSON,
  GetBandwidthBaremetal200ResponseToJSON,
  GetBareMetalUserdata200ResponseFromJSON,
  GetBareMetalUserdata200ResponseToJSON,
  GetBareMetalVnc200ResponseFromJSON,
  GetBareMetalVnc200ResponseToJSON,
  GetBareMetalsUpgrades200ResponseFromJSON,
  GetBareMetalsUpgrades200ResponseToJSON,
  GetBaremetal200ResponseFromJSON,
  GetBaremetal200ResponseToJSON,
  GetIpv4Baremetal200ResponseFromJSON,
  GetIpv4Baremetal200ResponseToJSON,
  GetIpv6Baremetal200ResponseFromJSON,
  GetIpv6Baremetal200ResponseToJSON,
  HaltBaremetalsRequestFromJSON,
  HaltBaremetalsRequestToJSON,
  ListBaremetalVpc2200ResponseFromJSON,
  ListBaremetalVpc2200ResponseToJSON,
  ListBaremetalVpcs200ResponseFromJSON,
  ListBaremetalVpcs200ResponseToJSON,
  ListBaremetals200ResponseFromJSON,
  ListBaremetals200ResponseToJSON,
  PostBaremetalInstanceIdIpv4ReverseDefaultRequestFromJSON,
  PostBaremetalInstanceIdIpv4ReverseDefaultRequestToJSON,
  ReinstallBaremetalRequestFromJSON,
  ReinstallBaremetalRequestToJSON,
  UpdateBaremetal202ResponseFromJSON,
  UpdateBaremetal202ResponseToJSON,
  UpdateBaremetalRequestFromJSON,
  UpdateBaremetalRequestToJSON,
} from '../models/index';

export interface AttachBaremetalsVpc2OperationRequest {
  baremetalId: string;
  attachBaremetalsVpc2Request?: AttachBaremetalsVpc2Request;
}

export interface AttachBaremetalsVpcsOperationRequest {
  baremetalId: string;
  attachBaremetalsVpcsRequest?: AttachBaremetalsVpcsRequest;
}

export interface CreateBaremetalOperationRequest {
  createBaremetalRequest?: CreateBaremetalRequest;
}

export interface CreateBaremetalReverseIpv4OperationRequest {
  baremetalId: string;
  createBaremetalReverseIpv4Request?: CreateBaremetalReverseIpv4Request;
}

export interface CreateBaremetalReverseIpv6OperationRequest {
  baremetalId: string;
  createBaremetalReverseIpv6Request?: CreateBaremetalReverseIpv6Request;
}

export interface DeleteBaremetalRequest {
  baremetalId: string;
}

export interface DeleteBaremetalReverseIpv6Request {
  baremetalId: string;
  ipv6: string;
}

export interface DetachBaremetalVpc2OperationRequest {
  baremetalId: string;
  detachBaremetalVpc2Request?: DetachBaremetalVpc2Request;
}

export interface DetachBaremetalVpcsOperationRequest {
  baremetalId: string;
  detachBaremetalVpcsRequest?: DetachBaremetalVpcsRequest;
}

export interface GetBandwidthBaremetalRequest {
  baremetalId: string;
}

export interface GetBareMetalUserdataRequest {
  baremetalId: string;
}

export interface GetBareMetalVncRequest {
  baremetalId: string;
}

export interface GetBareMetalsUpgradesRequest {
  baremetalId: string;
  type?: string;
}

export interface GetBaremetalRequest {
  baremetalId: string;
}

export interface GetIpv4BaremetalRequest {
  baremetalId: string;
}

export interface GetIpv6BaremetalRequest {
  baremetalId: string;
}

export interface HaltBaremetalRequest {
  baremetalId: string;
}

export interface HaltBaremetalsOperationRequest {
  haltBaremetalsRequest?: HaltBaremetalsRequest;
}

export interface ListBaremetalVpc2Request {
  baremetalId: string;
}

export interface ListBaremetalVpcsRequest {
  baremetalId: string;
}

export interface ListBaremetalsRequest {
  perPage?: number;
  cursor?: string;
}

export interface PostBaremetalInstanceIdIpv4ReverseDefaultOperationRequest {
  baremetalId: string;
  postBaremetalInstanceIdIpv4ReverseDefaultRequest?: PostBaremetalInstanceIdIpv4ReverseDefaultRequest;
}

export interface RebootBareMetalsRequest {
  haltBaremetalsRequest?: HaltBaremetalsRequest;
}

export interface RebootBaremetalRequest {
  baremetalId: string;
}

export interface ReinstallBaremetalOperationRequest {
  baremetalId: string;
  reinstallBaremetalRequest?: ReinstallBaremetalRequest;
}

export interface StartBareMetalsRequest {
  haltBaremetalsRequest?: HaltBaremetalsRequest;
}

export interface StartBaremetalRequest {
  baremetalId: string;
}

export interface UpdateBaremetalOperationRequest {
  baremetalId: string;
  updateBaremetalRequest?: UpdateBaremetalRequest;
}

/**
 *
 */
export class BaremetalApi extends runtime.BaseAPI {
  /**
   * Attach a VPC 2.0 Network to a Bare Metal Instance.<br><br>**Deprecated**: Migrate to VPC Networks and use [Attach VPC Network to Bare Metal Instance](#operation/attach-baremetals-vpcs) instead.
   * Attach VPC 2.0 Network to Bare Metal Instance
   * @deprecated
   */
  async attachBaremetalsVpc2Raw(
    requestParameters: AttachBaremetalsVpc2OperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling attachBaremetalsVpc2().',
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

    let urlPath = `/bare-metals/{baremetal-id}/vpc2/attach`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: AttachBaremetalsVpc2RequestToJSON(requestParameters['attachBaremetalsVpc2Request']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Attach a VPC 2.0 Network to a Bare Metal Instance.<br><br>**Deprecated**: Migrate to VPC Networks and use [Attach VPC Network to Bare Metal Instance](#operation/attach-baremetals-vpcs) instead.
   * Attach VPC 2.0 Network to Bare Metal Instance
   * @deprecated
   */
  async attachBaremetalsVpc2(
    baremetalId: string,
    attachBaremetalsVpc2Request?: AttachBaremetalsVpc2Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.attachBaremetalsVpc2Raw(
      { baremetalId: baremetalId, attachBaremetalsVpc2Request: attachBaremetalsVpc2Request },
      initOverrides,
    );
  }

  /**
   * Attach a VPC Network to a Bare Metal Instance.
   * Attach VPC Network to Bare Metal Instance
   */
  async attachBaremetalsVpcsRaw(
    requestParameters: AttachBaremetalsVpcsOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling attachBaremetalsVpcs().',
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

    let urlPath = `/bare-metals/{baremetal-id}/vpcs/attach`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: AttachBaremetalsVpcsRequestToJSON(requestParameters['attachBaremetalsVpcsRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Attach a VPC Network to a Bare Metal Instance.
   * Attach VPC Network to Bare Metal Instance
   */
  async attachBaremetalsVpcs(
    baremetalId: string,
    attachBaremetalsVpcsRequest?: AttachBaremetalsVpcsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.attachBaremetalsVpcsRaw(
      { baremetalId: baremetalId, attachBaremetalsVpcsRequest: attachBaremetalsVpcsRequest },
      initOverrides,
    );
  }

  /**
   * Create a new Bare Metal instance in a `region` with the desired `plan`. Choose one of the following to deploy the instance:  * `os_id` * `snapshot_id` * `app_id` * `image_id`  Supply other attributes as desired.
   * Create Bare Metal Instance
   */
  async createBaremetalRaw(
    requestParameters: CreateBaremetalOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateBaremetal202Response>> {
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

    let urlPath = `/bare-metals`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateBaremetalRequestToJSON(requestParameters['createBaremetalRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateBaremetal202ResponseFromJSON(jsonValue));
  }

  /**
   * Create a new Bare Metal instance in a `region` with the desired `plan`. Choose one of the following to deploy the instance:  * `os_id` * `snapshot_id` * `app_id` * `image_id`  Supply other attributes as desired.
   * Create Bare Metal Instance
   */
  async createBaremetal(
    createBaremetalRequest?: CreateBaremetalRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateBaremetal202Response> {
    const response = await this.createBaremetalRaw({ createBaremetalRequest: createBaremetalRequest }, initOverrides);
    return await response.value();
  }

  /**
   * Create a reverse IPv4 entry for a Bare Metal Instance. The `ip` and `reverse` attributes are required.
   * Create Baremetal Reverse IPv4
   */
  async createBaremetalReverseIpv4Raw(
    requestParameters: CreateBaremetalReverseIpv4OperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling createBaremetalReverseIpv4().',
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

    let urlPath = `/bare-metals/{baremetal-id}/ipv4/reverse`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateBaremetalReverseIpv4RequestToJSON(requestParameters['createBaremetalReverseIpv4Request']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Create a reverse IPv4 entry for a Bare Metal Instance. The `ip` and `reverse` attributes are required.
   * Create Baremetal Reverse IPv4
   */
  async createBaremetalReverseIpv4(
    baremetalId: string,
    createBaremetalReverseIpv4Request?: CreateBaremetalReverseIpv4Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.createBaremetalReverseIpv4Raw(
      { baremetalId: baremetalId, createBaremetalReverseIpv4Request: createBaremetalReverseIpv4Request },
      initOverrides,
    );
  }

  /**
   * Create a reverse IPv6 entry for a Bare Metal Instance. The `ip` and `reverse` attributes are required. IP address must be in full, expanded format.
   * Create Baremetal Reverse IPv6
   */
  async createBaremetalReverseIpv6Raw(
    requestParameters: CreateBaremetalReverseIpv6OperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling createBaremetalReverseIpv6().',
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

    let urlPath = `/bare-metals/{baremetal-id}/ipv6/reverse`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateBaremetalReverseIpv6RequestToJSON(requestParameters['createBaremetalReverseIpv6Request']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Create a reverse IPv6 entry for a Bare Metal Instance. The `ip` and `reverse` attributes are required. IP address must be in full, expanded format.
   * Create Baremetal Reverse IPv6
   */
  async createBaremetalReverseIpv6(
    baremetalId: string,
    createBaremetalReverseIpv6Request?: CreateBaremetalReverseIpv6Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.createBaremetalReverseIpv6Raw(
      { baremetalId: baremetalId, createBaremetalReverseIpv6Request: createBaremetalReverseIpv6Request },
      initOverrides,
    );
  }

  /**
   * Delete a Bare Metal instance.
   * Delete Bare Metal
   */
  async deleteBaremetalRaw(
    requestParameters: DeleteBaremetalRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling deleteBaremetal().',
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

    let urlPath = `/bare-metals/{baremetal-id}`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

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
   * Delete a Bare Metal instance.
   * Delete Bare Metal
   */
  async deleteBaremetal(baremetalId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.deleteBaremetalRaw({ baremetalId: baremetalId }, initOverrides);
  }

  /**
   * Delete the reverse IPv6 for a Bare metal instance.
   * Delete BareMetal Reverse IPv6
   */
  async deleteBaremetalReverseIpv6Raw(
    requestParameters: DeleteBaremetalReverseIpv6Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling deleteBaremetalReverseIpv6().',
      );
    }

    if (requestParameters['ipv6'] == null) {
      throw new runtime.RequiredError('ipv6', 'Required parameter "ipv6" was null or undefined when calling deleteBaremetalReverseIpv6().');
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

    let urlPath = `/bare-metals/{baremetal-id}/ipv6/reverse/{ipv6}`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));
    urlPath = urlPath.replace(`{${'ipv6'}}`, encodeURIComponent(String(requestParameters['ipv6'])));

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
   * Delete the reverse IPv6 for a Bare metal instance.
   * Delete BareMetal Reverse IPv6
   */
  async deleteBaremetalReverseIpv6(
    baremetalId: string,
    ipv6: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.deleteBaremetalReverseIpv6Raw({ baremetalId: baremetalId, ipv6: ipv6 }, initOverrides);
  }

  /**
   * Detach a VPC 2.0 Network from an Bare Metal Instance.<br><br>**Deprecated**: Migrate to VPC Networks and use [Detach VPC Network from Bare Metal Instance](#operation/detach-baremetal-vpcs) instead.
   * Detach VPC 2.0 Network from Bare Metal Instance
   * @deprecated
   */
  async detachBaremetalVpc2Raw(
    requestParameters: DetachBaremetalVpc2OperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling detachBaremetalVpc2().',
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

    let urlPath = `/bare-metals/{baremetal-id}/vpc2/detach`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: DetachBaremetalVpc2RequestToJSON(requestParameters['detachBaremetalVpc2Request']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Detach a VPC 2.0 Network from an Bare Metal Instance.<br><br>**Deprecated**: Migrate to VPC Networks and use [Detach VPC Network from Bare Metal Instance](#operation/detach-baremetal-vpcs) instead.
   * Detach VPC 2.0 Network from Bare Metal Instance
   * @deprecated
   */
  async detachBaremetalVpc2(
    baremetalId: string,
    detachBaremetalVpc2Request?: DetachBaremetalVpc2Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.detachBaremetalVpc2Raw({ baremetalId: baremetalId, detachBaremetalVpc2Request: detachBaremetalVpc2Request }, initOverrides);
  }

  /**
   * Detach a VPC Network from an Bare Metal Instance.
   * Detach VPC Network from Bare Metal Instance
   */
  async detachBaremetalVpcsRaw(
    requestParameters: DetachBaremetalVpcsOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling detachBaremetalVpcs().',
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

    let urlPath = `/bare-metals/{baremetal-id}/vpcs/detach`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: DetachBaremetalVpcsRequestToJSON(requestParameters['detachBaremetalVpcsRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Detach a VPC Network from an Bare Metal Instance.
   * Detach VPC Network from Bare Metal Instance
   */
  async detachBaremetalVpcs(
    baremetalId: string,
    detachBaremetalVpcsRequest?: DetachBaremetalVpcsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.detachBaremetalVpcsRaw({ baremetalId: baremetalId, detachBaremetalVpcsRequest: detachBaremetalVpcsRequest }, initOverrides);
  }

  /**
   * Get bandwidth information for the Bare Metal instance.<br><br>The `bandwidth` object in a successful response contains objects representing a day in the month. The date is denoted by the nested object keys. Days begin and end in the UTC timezone. Bandwidth utilization data contained within the date object is refreshed periodically. We do not recommend using this endpoint to gather real-time metrics.
   * Bare Metal Bandwidth
   */
  async getBandwidthBaremetalRaw(
    requestParameters: GetBandwidthBaremetalRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetBandwidthBaremetal200Response>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling getBandwidthBaremetal().',
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

    let urlPath = `/bare-metals/{baremetal-id}/bandwidth`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetBandwidthBaremetal200ResponseFromJSON(jsonValue));
  }

  /**
   * Get bandwidth information for the Bare Metal instance.<br><br>The `bandwidth` object in a successful response contains objects representing a day in the month. The date is denoted by the nested object keys. Days begin and end in the UTC timezone. Bandwidth utilization data contained within the date object is refreshed periodically. We do not recommend using this endpoint to gather real-time metrics.
   * Bare Metal Bandwidth
   */
  async getBandwidthBaremetal(
    baremetalId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetBandwidthBaremetal200Response> {
    const response = await this.getBandwidthBaremetalRaw({ baremetalId: baremetalId }, initOverrides);
    return await response.value();
  }

  /**
   * Get the user-supplied, base64 encoded [user data](https://docs.vultr.com/manage-instance-user-data-with-the-vultr-metadata-api/) for a Bare Metal.
   * Get Bare Metal User Data
   */
  async getBareMetalUserdataRaw(
    requestParameters: GetBareMetalUserdataRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetBareMetalUserdata200Response>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling getBareMetalUserdata().',
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

    let urlPath = `/bare-metals/{baremetal-id}/user-data`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetBareMetalUserdata200ResponseFromJSON(jsonValue));
  }

  /**
   * Get the user-supplied, base64 encoded [user data](https://docs.vultr.com/manage-instance-user-data-with-the-vultr-metadata-api/) for a Bare Metal.
   * Get Bare Metal User Data
   */
  async getBareMetalUserdata(
    baremetalId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetBareMetalUserdata200Response> {
    const response = await this.getBareMetalUserdataRaw({ baremetalId: baremetalId }, initOverrides);
    return await response.value();
  }

  /**
   * Get the VNC URL for a Bare Metal
   * Get VNC URL for a Bare Metal
   */
  async getBareMetalVncRaw(
    requestParameters: GetBareMetalVncRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetBareMetalVnc200Response>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling getBareMetalVnc().',
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

    let urlPath = `/bare-metals/{baremetal-id}/vnc`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetBareMetalVnc200ResponseFromJSON(jsonValue));
  }

  /**
   * Get the VNC URL for a Bare Metal
   * Get VNC URL for a Bare Metal
   */
  async getBareMetalVnc(
    baremetalId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetBareMetalVnc200Response> {
    const response = await this.getBareMetalVncRaw({ baremetalId: baremetalId }, initOverrides);
    return await response.value();
  }

  /**
   * Get available upgrades for a Bare Metal
   * Get Available Bare Metal Upgrades
   */
  async getBareMetalsUpgradesRaw(
    requestParameters: GetBareMetalsUpgradesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetBareMetalsUpgrades200Response>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling getBareMetalsUpgrades().',
      );
    }

    const queryParameters: any = {};

    if (requestParameters['type'] != null) {
      queryParameters['type'] = requestParameters['type'];
    }

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/bare-metals/{baremetal-id}/upgrades`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetBareMetalsUpgrades200ResponseFromJSON(jsonValue));
  }

  /**
   * Get available upgrades for a Bare Metal
   * Get Available Bare Metal Upgrades
   */
  async getBareMetalsUpgrades(
    baremetalId: string,
    type?: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetBareMetalsUpgrades200Response> {
    const response = await this.getBareMetalsUpgradesRaw({ baremetalId: baremetalId, type: type }, initOverrides);
    return await response.value();
  }

  /**
   * Get information for a Bare Metal instance.
   * Get Bare Metal
   */
  async getBaremetalRaw(
    requestParameters: GetBaremetalRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetBaremetal200Response>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError('baremetalId', 'Required parameter "baremetalId" was null or undefined when calling getBaremetal().');
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

    let urlPath = `/bare-metals/{baremetal-id}`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetBaremetal200ResponseFromJSON(jsonValue));
  }

  /**
   * Get information for a Bare Metal instance.
   * Get Bare Metal
   */
  async getBaremetal(baremetalId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetBaremetal200Response> {
    const response = await this.getBaremetalRaw({ baremetalId: baremetalId }, initOverrides);
    return await response.value();
  }

  /**
   * Get the IPv4 information for the Bare Metal instance.
   * Bare Metal IPv4 Addresses
   */
  async getIpv4BaremetalRaw(
    requestParameters: GetIpv4BaremetalRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetIpv4Baremetal200Response>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling getIpv4Baremetal().',
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

    let urlPath = `/bare-metals/{baremetal-id}/ipv4`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetIpv4Baremetal200ResponseFromJSON(jsonValue));
  }

  /**
   * Get the IPv4 information for the Bare Metal instance.
   * Bare Metal IPv4 Addresses
   */
  async getIpv4Baremetal(
    baremetalId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetIpv4Baremetal200Response> {
    const response = await this.getIpv4BaremetalRaw({ baremetalId: baremetalId }, initOverrides);
    return await response.value();
  }

  /**
   * Get the IPv6 information for the Bare Metal instance.
   * Bare Metal IPv6 Addresses
   */
  async getIpv6BaremetalRaw(
    requestParameters: GetIpv6BaremetalRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetIpv6Baremetal200Response>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling getIpv6Baremetal().',
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

    let urlPath = `/bare-metals/{baremetal-id}/ipv6`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetIpv6Baremetal200ResponseFromJSON(jsonValue));
  }

  /**
   * Get the IPv6 information for the Bare Metal instance.
   * Bare Metal IPv6 Addresses
   */
  async getIpv6Baremetal(
    baremetalId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetIpv6Baremetal200Response> {
    const response = await this.getIpv6BaremetalRaw({ baremetalId: baremetalId }, initOverrides);
    return await response.value();
  }

  /**
   * Halt the Bare Metal instance.
   * Halt Bare Metal
   */
  async haltBaremetalRaw(
    requestParameters: HaltBaremetalRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling haltBaremetal().',
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

    let urlPath = `/bare-metals/{baremetal-id}/halt`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Halt the Bare Metal instance.
   * Halt Bare Metal
   */
  async haltBaremetal(baremetalId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.haltBaremetalRaw({ baremetalId: baremetalId }, initOverrides);
  }

  /**
   * Halt Bare Metals.
   * Halt Bare Metals
   */
  async haltBaremetalsRaw(
    requestParameters: HaltBaremetalsOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
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

    let urlPath = `/bare-metals/halt`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: HaltBaremetalsRequestToJSON(requestParameters['haltBaremetalsRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Halt Bare Metals.
   * Halt Bare Metals
   */
  async haltBaremetals(
    haltBaremetalsRequest?: HaltBaremetalsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.haltBaremetalsRaw({ haltBaremetalsRequest: haltBaremetalsRequest }, initOverrides);
  }

  /**
   * List the VPC 2.0 networks for a Bare Metal Instance.<br><br>**Deprecated**: Migrate to VPC Networks and use [List Bare Metal Instance VPC Networks](#operation/list-baremetal-vpcs) instead.
   * List Bare Metal Instance VPC 2.0 Networks
   * @deprecated
   */
  async listBaremetalVpc2Raw(
    requestParameters: ListBaremetalVpc2Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListBaremetalVpc2200Response>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling listBaremetalVpc2().',
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

    let urlPath = `/bare-metals/{baremetal-id}/vpc2`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListBaremetalVpc2200ResponseFromJSON(jsonValue));
  }

  /**
   * List the VPC 2.0 networks for a Bare Metal Instance.<br><br>**Deprecated**: Migrate to VPC Networks and use [List Bare Metal Instance VPC Networks](#operation/list-baremetal-vpcs) instead.
   * List Bare Metal Instance VPC 2.0 Networks
   * @deprecated
   */
  async listBaremetalVpc2(
    baremetalId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListBaremetalVpc2200Response> {
    const response = await this.listBaremetalVpc2Raw({ baremetalId: baremetalId }, initOverrides);
    return await response.value();
  }

  /**
   * List the VPC networks for a Bare Metal Instance.
   * List Bare Metal Instance VPC Networks
   */
  async listBaremetalVpcsRaw(
    requestParameters: ListBaremetalVpcsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListBaremetalVpcs200Response>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling listBaremetalVpcs().',
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

    let urlPath = `/bare-metals/{baremetal-id}/vpcs`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListBaremetalVpcs200ResponseFromJSON(jsonValue));
  }

  /**
   * List the VPC networks for a Bare Metal Instance.
   * List Bare Metal Instance VPC Networks
   */
  async listBaremetalVpcs(
    baremetalId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListBaremetalVpcs200Response> {
    const response = await this.listBaremetalVpcsRaw({ baremetalId: baremetalId }, initOverrides);
    return await response.value();
  }

  /**
   * List all Bare Metal instances in your account.
   * List Bare Metal Instances
   */
  async listBaremetalsRaw(
    requestParameters: ListBaremetalsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListBaremetals200Response>> {
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

    let urlPath = `/bare-metals`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListBaremetals200ResponseFromJSON(jsonValue));
  }

  /**
   * List all Bare Metal instances in your account.
   * List Bare Metal Instances
   */
  async listBaremetals(
    perPage?: number,
    cursor?: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListBaremetals200Response> {
    const response = await this.listBaremetalsRaw({ perPage: perPage, cursor: cursor }, initOverrides);
    return await response.value();
  }

  /**
   * Set a reverse DNS entry for an IPv4 address
   * Set Default Reverse DNS Entry
   */
  async postBaremetalInstanceIdIpv4ReverseDefaultRaw(
    requestParameters: PostBaremetalInstanceIdIpv4ReverseDefaultOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling postBaremetalInstanceIdIpv4ReverseDefault().',
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

    let urlPath = `/bare-metals/{baremetal-id}/ipv4/reverse/default`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: PostBaremetalInstanceIdIpv4ReverseDefaultRequestToJSON(requestParameters['postBaremetalInstanceIdIpv4ReverseDefaultRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Set a reverse DNS entry for an IPv4 address
   * Set Default Reverse DNS Entry
   */
  async postBaremetalInstanceIdIpv4ReverseDefault(
    baremetalId: string,
    postBaremetalInstanceIdIpv4ReverseDefaultRequest?: PostBaremetalInstanceIdIpv4ReverseDefaultRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.postBaremetalInstanceIdIpv4ReverseDefaultRaw(
      { baremetalId: baremetalId, postBaremetalInstanceIdIpv4ReverseDefaultRequest: postBaremetalInstanceIdIpv4ReverseDefaultRequest },
      initOverrides,
    );
  }

  /**
   * Reboot Bare Metals.
   * Reboot Bare Metals
   */
  async rebootBareMetalsRaw(
    requestParameters: RebootBareMetalsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
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

    let urlPath = `/bare-metals/reboot`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: HaltBaremetalsRequestToJSON(requestParameters['haltBaremetalsRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Reboot Bare Metals.
   * Reboot Bare Metals
   */
  async rebootBareMetals(
    haltBaremetalsRequest?: HaltBaremetalsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.rebootBareMetalsRaw({ haltBaremetalsRequest: haltBaremetalsRequest }, initOverrides);
  }

  /**
   * Reboot the Bare Metal instance.
   * Reboot Bare Metal
   */
  async rebootBaremetalRaw(
    requestParameters: RebootBaremetalRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling rebootBaremetal().',
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

    let urlPath = `/bare-metals/{baremetal-id}/reboot`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Reboot the Bare Metal instance.
   * Reboot Bare Metal
   */
  async rebootBaremetal(baremetalId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.rebootBaremetalRaw({ baremetalId: baremetalId }, initOverrides);
  }

  /**
   * Reinstall the Bare Metal instance using an optional `hostname`.   **Note:** This action may take some time to complete.
   * Reinstall Bare Metal
   */
  async reinstallBaremetalRaw(
    requestParameters: ReinstallBaremetalOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<UpdateBaremetal202Response>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling reinstallBaremetal().',
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

    let urlPath = `/bare-metals/{baremetal-id}/reinstall`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: ReinstallBaremetalRequestToJSON(requestParameters['reinstallBaremetalRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => UpdateBaremetal202ResponseFromJSON(jsonValue));
  }

  /**
   * Reinstall the Bare Metal instance using an optional `hostname`.   **Note:** This action may take some time to complete.
   * Reinstall Bare Metal
   */
  async reinstallBaremetal(
    baremetalId: string,
    reinstallBaremetalRequest?: ReinstallBaremetalRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<UpdateBaremetal202Response> {
    const response = await this.reinstallBaremetalRaw(
      { baremetalId: baremetalId, reinstallBaremetalRequest: reinstallBaremetalRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Start Bare Metals.
   * Start Bare Metals
   */
  async startBareMetalsRaw(
    requestParameters: StartBareMetalsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
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

    let urlPath = `/bare-metals/start`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: HaltBaremetalsRequestToJSON(requestParameters['haltBaremetalsRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Start Bare Metals.
   * Start Bare Metals
   */
  async startBareMetals(
    haltBaremetalsRequest?: HaltBaremetalsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.startBareMetalsRaw({ haltBaremetalsRequest: haltBaremetalsRequest }, initOverrides);
  }

  /**
   * Start the Bare Metal instance.
   * Start Bare Metal
   */
  async startBaremetalRaw(
    requestParameters: StartBaremetalRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling startBaremetal().',
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

    let urlPath = `/bare-metals/{baremetal-id}/start`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Start the Bare Metal instance.
   * Start Bare Metal
   */
  async startBaremetal(baremetalId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.startBaremetalRaw({ baremetalId: baremetalId }, initOverrides);
  }

  /**
   * Update a Bare Metal instance. All attributes are optional. If not set, the attributes will retain their original values.  **Note:** Changing `os_id`, `app_id` or `image_id` may take a few extra seconds to complete.
   * Update Bare Metal
   */
  async updateBaremetalRaw(
    requestParameters: UpdateBaremetalOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<UpdateBaremetal202Response>> {
    if (requestParameters['baremetalId'] == null) {
      throw new runtime.RequiredError(
        'baremetalId',
        'Required parameter "baremetalId" was null or undefined when calling updateBaremetal().',
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

    let urlPath = `/bare-metals/{baremetal-id}`;
    urlPath = urlPath.replace(`{${'baremetal-id'}}`, encodeURIComponent(String(requestParameters['baremetalId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PATCH',
        headers: headerParameters,
        query: queryParameters,
        body: UpdateBaremetalRequestToJSON(requestParameters['updateBaremetalRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => UpdateBaremetal202ResponseFromJSON(jsonValue));
  }

  /**
   * Update a Bare Metal instance. All attributes are optional. If not set, the attributes will retain their original values.  **Note:** Changing `os_id`, `app_id` or `image_id` may take a few extra seconds to complete.
   * Update Bare Metal
   */
  async updateBaremetal(
    baremetalId: string,
    updateBaremetalRequest?: UpdateBaremetalRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<UpdateBaremetal202Response> {
    const response = await this.updateBaremetalRaw(
      { baremetalId: baremetalId, updateBaremetalRequest: updateBaremetalRequest },
      initOverrides,
    );
    return await response.value();
  }
}
