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
  AttachVpc2NodesRequest,
  CreateVpc2Request,
  DetachVpc2NodesRequest,
  GetVpc2200Response,
  ListVpc2200Response,
  ListVpc2Nodes200Response,
  UpdateVpc2Request,
} from '../models/index';
import {
  AttachVpc2NodesRequestFromJSON,
  AttachVpc2NodesRequestToJSON,
  CreateVpc2RequestFromJSON,
  CreateVpc2RequestToJSON,
  DetachVpc2NodesRequestFromJSON,
  DetachVpc2NodesRequestToJSON,
  GetVpc2200ResponseFromJSON,
  GetVpc2200ResponseToJSON,
  ListVpc2200ResponseFromJSON,
  ListVpc2200ResponseToJSON,
  ListVpc2Nodes200ResponseFromJSON,
  ListVpc2Nodes200ResponseToJSON,
  UpdateVpc2RequestFromJSON,
  UpdateVpc2RequestToJSON,
} from '../models/index';

export interface AttachVpc2NodesOperationRequest {
  vpcId: string;
  attachVpc2NodesRequest?: AttachVpc2NodesRequest;
}

export interface CreateVpc2OperationRequest {
  createVpc2Request?: CreateVpc2Request;
}

export interface DeleteVpc2Request {
  vpcId: string;
}

export interface DetachVpc2NodesOperationRequest {
  vpcId: string;
  detachVpc2NodesRequest?: DetachVpc2NodesRequest;
}

export interface GetVpc2Request {
  vpcId: string;
}

export interface ListVpc2Request {
  perPage?: number;
  cursor?: string;
}

export interface ListVpc2NodesRequest {
  vpcId: string;
  perPage?: number;
  cursor?: string;
}

export interface UpdateVpc2OperationRequest {
  vpcId: string;
  updateVpc2Request?: UpdateVpc2Request;
}

/**
 *
 */
export class VPC2Api extends runtime.BaseAPI {
  /**
   * Attach nodes to a VPC 2.0 network.<br><br>**Deprecated**: Use [VPCs](#tag/VPCs) instead.
   * Attach nodes to a VPC 2.0 network
   * @deprecated
   */
  async attachVpc2NodesRaw(
    requestParameters: AttachVpc2NodesOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['vpcId'] == null) {
      throw new runtime.RequiredError('vpcId', 'Required parameter "vpcId" was null or undefined when calling attachVpc2Nodes().');
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

    let urlPath = `/vpc2/{vpc-id}/nodes/attach`;
    urlPath = urlPath.replace(`{${'vpc-id'}}`, encodeURIComponent(String(requestParameters['vpcId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: AttachVpc2NodesRequestToJSON(requestParameters['attachVpc2NodesRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Attach nodes to a VPC 2.0 network.<br><br>**Deprecated**: Use [VPCs](#tag/VPCs) instead.
   * Attach nodes to a VPC 2.0 network
   * @deprecated
   */
  async attachVpc2Nodes(
    vpcId: string,
    attachVpc2NodesRequest?: AttachVpc2NodesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.attachVpc2NodesRaw({ vpcId: vpcId, attachVpc2NodesRequest: attachVpc2NodesRequest }, initOverrides);
  }

  /**
   * Create a new VPC 2.0 network in a `region`.  **Deprecated**: Migrate to VPC Networks and use [Create a VPC](#operation/create-vpc) instead.  VPCs should use [RFC1918 private address space](https://tools.ietf.org/html/rfc1918):      10.0.0.0    - 10.255.255.255  (10/8 prefix)     172.16.0.0  - 172.31.255.255  (172.16/12 prefix)     192.168.0.0 - 192.168.255.255 (192.168/16 prefix)
   * Create a VPC 2.0 network
   * @deprecated
   */
  async createVpc2Raw(
    requestParameters: CreateVpc2OperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetVpc2200Response>> {
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

    let urlPath = `/vpc2`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateVpc2RequestToJSON(requestParameters['createVpc2Request']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetVpc2200ResponseFromJSON(jsonValue));
  }

  /**
   * Create a new VPC 2.0 network in a `region`.  **Deprecated**: Migrate to VPC Networks and use [Create a VPC](#operation/create-vpc) instead.  VPCs should use [RFC1918 private address space](https://tools.ietf.org/html/rfc1918):      10.0.0.0    - 10.255.255.255  (10/8 prefix)     172.16.0.0  - 172.31.255.255  (172.16/12 prefix)     192.168.0.0 - 192.168.255.255 (192.168/16 prefix)
   * Create a VPC 2.0 network
   * @deprecated
   */
  async createVpc2(
    createVpc2Request?: CreateVpc2Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetVpc2200Response> {
    const response = await this.createVpc2Raw({ createVpc2Request: createVpc2Request }, initOverrides);
    return await response.value();
  }

  /**
   * Delete a VPC 2.0 network.<br><br>**Deprecated**: Migrate to VPC Networks and use [Delete a VPC](#operation/delete-vpc) instead.
   * Delete a VPC 2.0 network
   * @deprecated
   */
  async deleteVpc2Raw(
    requestParameters: DeleteVpc2Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['vpcId'] == null) {
      throw new runtime.RequiredError('vpcId', 'Required parameter "vpcId" was null or undefined when calling deleteVpc2().');
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

    let urlPath = `/vpc2/{vpc-id}`;
    urlPath = urlPath.replace(`{${'vpc-id'}}`, encodeURIComponent(String(requestParameters['vpcId'])));

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
   * Delete a VPC 2.0 network.<br><br>**Deprecated**: Migrate to VPC Networks and use [Delete a VPC](#operation/delete-vpc) instead.
   * Delete a VPC 2.0 network
   * @deprecated
   */
  async deleteVpc2(vpcId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.deleteVpc2Raw({ vpcId: vpcId }, initOverrides);
  }

  /**
   * Remove nodes from a VPC 2.0 network.<br><br>**Deprecated**: Use [VPCs](#tag/VPCs) instead.
   * Remove nodes from a VPC 2.0 network
   * @deprecated
   */
  async detachVpc2NodesRaw(
    requestParameters: DetachVpc2NodesOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['vpcId'] == null) {
      throw new runtime.RequiredError('vpcId', 'Required parameter "vpcId" was null or undefined when calling detachVpc2Nodes().');
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

    let urlPath = `/vpc2/{vpc-id}/nodes/detach`;
    urlPath = urlPath.replace(`{${'vpc-id'}}`, encodeURIComponent(String(requestParameters['vpcId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: DetachVpc2NodesRequestToJSON(requestParameters['detachVpc2NodesRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Remove nodes from a VPC 2.0 network.<br><br>**Deprecated**: Use [VPCs](#tag/VPCs) instead.
   * Remove nodes from a VPC 2.0 network
   * @deprecated
   */
  async detachVpc2Nodes(
    vpcId: string,
    detachVpc2NodesRequest?: DetachVpc2NodesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.detachVpc2NodesRaw({ vpcId: vpcId, detachVpc2NodesRequest: detachVpc2NodesRequest }, initOverrides);
  }

  /**
   * Get information about a VPC 2.0 network.<br><br>**Deprecated**: Migrate to VPC Networks and use [Get a VPC](#operation/get-vpc) instead.
   * Get a VPC 2.0 network
   * @deprecated
   */
  async getVpc2Raw(
    requestParameters: GetVpc2Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetVpc2200Response>> {
    if (requestParameters['vpcId'] == null) {
      throw new runtime.RequiredError('vpcId', 'Required parameter "vpcId" was null or undefined when calling getVpc2().');
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

    let urlPath = `/vpc2/{vpc-id}`;
    urlPath = urlPath.replace(`{${'vpc-id'}}`, encodeURIComponent(String(requestParameters['vpcId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetVpc2200ResponseFromJSON(jsonValue));
  }

  /**
   * Get information about a VPC 2.0 network.<br><br>**Deprecated**: Migrate to VPC Networks and use [Get a VPC](#operation/get-vpc) instead.
   * Get a VPC 2.0 network
   * @deprecated
   */
  async getVpc2(vpcId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetVpc2200Response> {
    const response = await this.getVpc2Raw({ vpcId: vpcId }, initOverrides);
    return await response.value();
  }

  /**
   * Get a list of all VPC 2.0 networks in your account.<br><br>**Deprecated**: Migrate to VPC Networks and use [List VPCs](#operation/list-vpcs) instead.
   * List VPC 2.0 networks
   * @deprecated
   */
  async listVpc2Raw(
    requestParameters: ListVpc2Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListVpc2200Response>> {
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

    let urlPath = `/vpc2`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListVpc2200ResponseFromJSON(jsonValue));
  }

  /**
   * Get a list of all VPC 2.0 networks in your account.<br><br>**Deprecated**: Migrate to VPC Networks and use [List VPCs](#operation/list-vpcs) instead.
   * List VPC 2.0 networks
   * @deprecated
   */
  async listVpc2(
    perPage?: number,
    cursor?: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListVpc2200Response> {
    const response = await this.listVpc2Raw({ perPage: perPage, cursor: cursor }, initOverrides);
    return await response.value();
  }

  /**
   * Get a list of nodes attached to a VPC 2.0 network.<br><br>**Deprecated**: Use [VPCs](#tag/VPCs) instead.
   * Get a list of nodes attached to a VPC 2.0 network
   * @deprecated
   */
  async listVpc2NodesRaw(
    requestParameters: ListVpc2NodesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListVpc2Nodes200Response>> {
    if (requestParameters['vpcId'] == null) {
      throw new runtime.RequiredError('vpcId', 'Required parameter "vpcId" was null or undefined when calling listVpc2Nodes().');
    }

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

    let urlPath = `/vpc2/{vpc-id}/nodes`;
    urlPath = urlPath.replace(`{${'vpc-id'}}`, encodeURIComponent(String(requestParameters['vpcId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListVpc2Nodes200ResponseFromJSON(jsonValue));
  }

  /**
   * Get a list of nodes attached to a VPC 2.0 network.<br><br>**Deprecated**: Use [VPCs](#tag/VPCs) instead.
   * Get a list of nodes attached to a VPC 2.0 network
   * @deprecated
   */
  async listVpc2Nodes(
    vpcId: string,
    perPage?: number,
    cursor?: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListVpc2Nodes200Response> {
    const response = await this.listVpc2NodesRaw({ vpcId: vpcId, perPage: perPage, cursor: cursor }, initOverrides);
    return await response.value();
  }

  /**
   * Update information for a VPC 2.0 network.<br><br>**Deprecated**: Migrate to VPC Networks and use [Update a VPC](#operation/update-vpc) instead.
   * Update a VPC 2.0 network
   * @deprecated
   */
  async updateVpc2Raw(
    requestParameters: UpdateVpc2OperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['vpcId'] == null) {
      throw new runtime.RequiredError('vpcId', 'Required parameter "vpcId" was null or undefined when calling updateVpc2().');
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

    let urlPath = `/vpc2/{vpc-id}`;
    urlPath = urlPath.replace(`{${'vpc-id'}}`, encodeURIComponent(String(requestParameters['vpcId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: UpdateVpc2RequestToJSON(requestParameters['updateVpc2Request']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Update information for a VPC 2.0 network.<br><br>**Deprecated**: Migrate to VPC Networks and use [Update a VPC](#operation/update-vpc) instead.
   * Update a VPC 2.0 network
   * @deprecated
   */
  async updateVpc2(
    vpcId: string,
    updateVpc2Request?: UpdateVpc2Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.updateVpc2Raw({ vpcId: vpcId, updateVpc2Request: updateVpc2Request }, initOverrides);
  }
}
