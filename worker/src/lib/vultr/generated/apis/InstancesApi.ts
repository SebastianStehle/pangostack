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
  AttachInstanceIso202Response,
  AttachInstanceIsoRequest,
  AttachInstanceNetworkRequest,
  AttachInstanceVpc2Request,
  AttachInstanceVpcRequest,
  CreateBaremetalReverseIpv4Request,
  CreateBaremetalReverseIpv6Request,
  CreateInstance202Response,
  CreateInstanceBackupScheduleRequest,
  CreateInstanceIpv4Request,
  CreateInstanceRequest,
  DetachInstanceIso202Response,
  DetachInstanceNetworkRequest,
  DetachInstanceVpc2Request,
  DetachInstanceVpcRequest,
  GetBandwidthBaremetal200Response,
  GetInstance200Response,
  GetInstanceBackupSchedule200Response,
  GetInstanceIsoStatus200Response,
  GetInstanceJob200Response,
  GetInstanceNeighbors200Response,
  GetInstanceUpgrades200Response,
  GetInstanceUserdata200Response,
  GetIpv4Baremetal200Response,
  GetIpv6Baremetal200Response,
  HaltInstancesRequest,
  ListInstanceIpv6Reverse200Response,
  ListInstancePrivateNetworks200Response,
  ListInstanceVpc2200Response,
  ListInstanceVpcs200Response,
  ListInstances200Response,
  PostBaremetalInstanceIdIpv4ReverseDefaultRequest,
  RebootInstancesRequest,
  ReinstallInstanceRequest,
  RestoreInstance202Response,
  RestoreInstanceRequest,
  StartInstancesRequest,
  UpdateInstanceRequest,
} from '../models/index';
import {
  AttachInstanceIso202ResponseFromJSON,
  AttachInstanceIso202ResponseToJSON,
  AttachInstanceIsoRequestFromJSON,
  AttachInstanceIsoRequestToJSON,
  AttachInstanceNetworkRequestFromJSON,
  AttachInstanceNetworkRequestToJSON,
  AttachInstanceVpc2RequestFromJSON,
  AttachInstanceVpc2RequestToJSON,
  AttachInstanceVpcRequestFromJSON,
  AttachInstanceVpcRequestToJSON,
  CreateBaremetalReverseIpv4RequestFromJSON,
  CreateBaremetalReverseIpv4RequestToJSON,
  CreateBaremetalReverseIpv6RequestFromJSON,
  CreateBaremetalReverseIpv6RequestToJSON,
  CreateInstance202ResponseFromJSON,
  CreateInstance202ResponseToJSON,
  CreateInstanceBackupScheduleRequestFromJSON,
  CreateInstanceBackupScheduleRequestToJSON,
  CreateInstanceIpv4RequestFromJSON,
  CreateInstanceIpv4RequestToJSON,
  CreateInstanceRequestFromJSON,
  CreateInstanceRequestToJSON,
  DetachInstanceIso202ResponseFromJSON,
  DetachInstanceIso202ResponseToJSON,
  DetachInstanceNetworkRequestFromJSON,
  DetachInstanceNetworkRequestToJSON,
  DetachInstanceVpc2RequestFromJSON,
  DetachInstanceVpc2RequestToJSON,
  DetachInstanceVpcRequestFromJSON,
  DetachInstanceVpcRequestToJSON,
  GetBandwidthBaremetal200ResponseFromJSON,
  GetBandwidthBaremetal200ResponseToJSON,
  GetInstance200ResponseFromJSON,
  GetInstance200ResponseToJSON,
  GetInstanceBackupSchedule200ResponseFromJSON,
  GetInstanceBackupSchedule200ResponseToJSON,
  GetInstanceIsoStatus200ResponseFromJSON,
  GetInstanceIsoStatus200ResponseToJSON,
  GetInstanceJob200ResponseFromJSON,
  GetInstanceJob200ResponseToJSON,
  GetInstanceNeighbors200ResponseFromJSON,
  GetInstanceNeighbors200ResponseToJSON,
  GetInstanceUpgrades200ResponseFromJSON,
  GetInstanceUpgrades200ResponseToJSON,
  GetInstanceUserdata200ResponseFromJSON,
  GetInstanceUserdata200ResponseToJSON,
  GetIpv4Baremetal200ResponseFromJSON,
  GetIpv4Baremetal200ResponseToJSON,
  GetIpv6Baremetal200ResponseFromJSON,
  GetIpv6Baremetal200ResponseToJSON,
  HaltInstancesRequestFromJSON,
  HaltInstancesRequestToJSON,
  ListInstanceIpv6Reverse200ResponseFromJSON,
  ListInstanceIpv6Reverse200ResponseToJSON,
  ListInstancePrivateNetworks200ResponseFromJSON,
  ListInstancePrivateNetworks200ResponseToJSON,
  ListInstanceVpc2200ResponseFromJSON,
  ListInstanceVpc2200ResponseToJSON,
  ListInstanceVpcs200ResponseFromJSON,
  ListInstanceVpcs200ResponseToJSON,
  ListInstances200ResponseFromJSON,
  ListInstances200ResponseToJSON,
  PostBaremetalInstanceIdIpv4ReverseDefaultRequestFromJSON,
  PostBaremetalInstanceIdIpv4ReverseDefaultRequestToJSON,
  RebootInstancesRequestFromJSON,
  RebootInstancesRequestToJSON,
  ReinstallInstanceRequestFromJSON,
  ReinstallInstanceRequestToJSON,
  RestoreInstance202ResponseFromJSON,
  RestoreInstance202ResponseToJSON,
  RestoreInstanceRequestFromJSON,
  RestoreInstanceRequestToJSON,
  StartInstancesRequestFromJSON,
  StartInstancesRequestToJSON,
  UpdateInstanceRequestFromJSON,
  UpdateInstanceRequestToJSON,
} from '../models/index';

export interface AttachInstanceIsoOperationRequest {
  instanceId: string;
  attachInstanceIsoRequest?: AttachInstanceIsoRequest;
}

export interface AttachInstanceNetworkOperationRequest {
  instanceId: string;
  attachInstanceNetworkRequest?: AttachInstanceNetworkRequest;
}

export interface AttachInstanceVpcOperationRequest {
  instanceId: string;
  attachInstanceVpcRequest?: AttachInstanceVpcRequest;
}

export interface AttachInstanceVpc2OperationRequest {
  instanceId: string;
  attachInstanceVpc2Request?: AttachInstanceVpc2Request;
}

export interface CreateInstanceOperationRequest {
  createInstanceRequest?: CreateInstanceRequest;
}

export interface CreateInstanceBackupScheduleOperationRequest {
  instanceId: string;
  createInstanceBackupScheduleRequest?: CreateInstanceBackupScheduleRequest;
}

export interface CreateInstanceIpv4OperationRequest {
  instanceId: string;
  createInstanceIpv4Request?: CreateInstanceIpv4Request;
}

export interface CreateInstanceReverseIpv4Request {
  instanceId: string;
  createBaremetalReverseIpv4Request?: CreateBaremetalReverseIpv4Request;
}

export interface CreateInstanceReverseIpv6Request {
  instanceId: string;
  createBaremetalReverseIpv6Request?: CreateBaremetalReverseIpv6Request;
}

export interface DeleteInstanceRequest {
  instanceId: string;
}

export interface DeleteInstanceIpv4Request {
  instanceId: string;
  ipv4: string;
}

export interface DeleteInstanceReverseIpv6Request {
  instanceId: string;
  ipv6: string;
}

export interface DetachInstanceIsoRequest {
  instanceId: string;
}

export interface DetachInstanceNetworkOperationRequest {
  instanceId: string;
  detachInstanceNetworkRequest?: DetachInstanceNetworkRequest;
}

export interface DetachInstanceVpcOperationRequest {
  instanceId: string;
  detachInstanceVpcRequest?: DetachInstanceVpcRequest;
}

export interface DetachInstanceVpc2OperationRequest {
  instanceId: string;
  detachInstanceVpc2Request?: DetachInstanceVpc2Request;
}

export interface GetInstanceRequest {
  instanceId: string;
}

export interface GetInstanceBackupScheduleRequest {
  instanceId: string;
}

export interface GetInstanceBandwidthRequest {
  instanceId: string;
  dateRange?: number;
}

export interface GetInstanceIpv4Request {
  instanceId: string;
  publicNetwork?: boolean;
  perPage?: number;
  cursor?: string;
}

export interface GetInstanceIpv6Request {
  instanceId: string;
}

export interface GetInstanceIsoStatusRequest {
  instanceId: string;
}

export interface GetInstanceJobRequest {
  jobId: string;
}

export interface GetInstanceNeighborsRequest {
  instanceId: string;
}

export interface GetInstanceUpgradesRequest {
  instanceId: string;
  type?: string;
}

export interface GetInstanceUserdataRequest {
  instanceId: string;
}

export interface HaltInstanceRequest {
  instanceId: string;
}

export interface HaltInstancesOperationRequest {
  haltInstancesRequest?: HaltInstancesRequest;
}

export interface ListInstanceIpv6ReverseRequest {
  instanceId: string;
}

export interface ListInstancePrivateNetworksRequest {
  instanceId: string;
  perPage?: number;
  cursor?: string;
}

export interface ListInstanceVpc2Request {
  instanceId: string;
  perPage?: number;
  cursor?: string;
}

export interface ListInstanceVpcsRequest {
  instanceId: string;
  perPage?: number;
  cursor?: string;
}

export interface ListInstancesRequest {
  perPage?: number;
  cursor?: string;
  tag?: string;
  label?: string;
  mainIp?: string;
  region?: string;
  firewallGroupId?: string;
  hostname?: string;
  showPendingCharges?: boolean;
}

export interface PostInstancesInstanceIdIpv4ReverseDefaultRequest {
  instanceId: string;
  postBaremetalInstanceIdIpv4ReverseDefaultRequest?: PostBaremetalInstanceIdIpv4ReverseDefaultRequest;
}

export interface RebootInstanceRequest {
  instanceId: string;
}

export interface RebootInstancesOperationRequest {
  rebootInstancesRequest?: RebootInstancesRequest;
}

export interface ReinstallInstanceOperationRequest {
  instanceId: string;
  reinstallInstanceRequest?: ReinstallInstanceRequest;
}

export interface RestoreInstanceOperationRequest {
  instanceId: string;
  restoreInstanceRequest?: RestoreInstanceRequest;
}

export interface StartInstanceRequest {
  instanceId: string;
}

export interface StartInstancesOperationRequest {
  startInstancesRequest?: StartInstancesRequest;
}

export interface UpdateInstanceOperationRequest {
  instanceId: string;
  updateInstanceRequest?: UpdateInstanceRequest;
}

/**
 *
 */
export class InstancesApi extends runtime.BaseAPI {
  /**
   * Attach an ISO to an Instance.
   * Attach ISO to Instance
   */
  async attachInstanceIsoRaw(
    requestParameters: AttachInstanceIsoOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<AttachInstanceIso202Response>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling attachInstanceIso().',
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

    let urlPath = `/instances/{instance-id}/iso/attach`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: AttachInstanceIsoRequestToJSON(requestParameters['attachInstanceIsoRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => AttachInstanceIso202ResponseFromJSON(jsonValue));
  }

  /**
   * Attach an ISO to an Instance.
   * Attach ISO to Instance
   */
  async attachInstanceIso(
    instanceId: string,
    attachInstanceIsoRequest?: AttachInstanceIsoRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<AttachInstanceIso202Response> {
    const response = await this.attachInstanceIsoRaw(
      { instanceId: instanceId, attachInstanceIsoRequest: attachInstanceIsoRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Attach Private Network to an Instance.<br><br>**Deprecated**: use [Attach VPC to Instance](#operation/attach-instance-vpc) instead.
   * Attach Private Network to Instance
   * @deprecated
   */
  async attachInstanceNetworkRaw(
    requestParameters: AttachInstanceNetworkOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling attachInstanceNetwork().',
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

    let urlPath = `/instances/{instance-id}/private-networks/attach`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: AttachInstanceNetworkRequestToJSON(requestParameters['attachInstanceNetworkRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Attach Private Network to an Instance.<br><br>**Deprecated**: use [Attach VPC to Instance](#operation/attach-instance-vpc) instead.
   * Attach Private Network to Instance
   * @deprecated
   */
  async attachInstanceNetwork(
    instanceId: string,
    attachInstanceNetworkRequest?: AttachInstanceNetworkRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.attachInstanceNetworkRaw(
      { instanceId: instanceId, attachInstanceNetworkRequest: attachInstanceNetworkRequest },
      initOverrides,
    );
  }

  /**
   * Attach a VPC to an Instance.
   * Attach VPC to Instance
   */
  async attachInstanceVpcRaw(
    requestParameters: AttachInstanceVpcOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling attachInstanceVpc().',
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

    let urlPath = `/instances/{instance-id}/vpcs/attach`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: AttachInstanceVpcRequestToJSON(requestParameters['attachInstanceVpcRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Attach a VPC to an Instance.
   * Attach VPC to Instance
   */
  async attachInstanceVpc(
    instanceId: string,
    attachInstanceVpcRequest?: AttachInstanceVpcRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.attachInstanceVpcRaw({ instanceId: instanceId, attachInstanceVpcRequest: attachInstanceVpcRequest }, initOverrides);
  }

  /**
   * Attach a VPC 2.0 Network to an Instance.<br><br>**Deprecated**: Migrate to VPC Networks and use [Attach VPC to Instance](#operation/attach-instance-vpc) instead.
   * Attach VPC 2.0 Network to Instance
   * @deprecated
   */
  async attachInstanceVpc2Raw(
    requestParameters: AttachInstanceVpc2OperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling attachInstanceVpc2().',
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

    let urlPath = `/instances/{instance-id}/vpc2/attach`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: AttachInstanceVpc2RequestToJSON(requestParameters['attachInstanceVpc2Request']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Attach a VPC 2.0 Network to an Instance.<br><br>**Deprecated**: Migrate to VPC Networks and use [Attach VPC to Instance](#operation/attach-instance-vpc) instead.
   * Attach VPC 2.0 Network to Instance
   * @deprecated
   */
  async attachInstanceVpc2(
    instanceId: string,
    attachInstanceVpc2Request?: AttachInstanceVpc2Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.attachInstanceVpc2Raw({ instanceId: instanceId, attachInstanceVpc2Request: attachInstanceVpc2Request }, initOverrides);
  }

  /**
   * Create a new VPS Instance in a `region` with the desired `plan`. Choose one of the following to deploy the instance:  * `os_id` * `iso_id` * `snapshot_id` * `app_id` * `image_id`  Supply other attributes as desired.
   * Create Instance
   */
  async createInstanceRaw(
    requestParameters: CreateInstanceOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateInstance202Response>> {
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

    let urlPath = `/instances`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateInstanceRequestToJSON(requestParameters['createInstanceRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateInstance202ResponseFromJSON(jsonValue));
  }

  /**
   * Create a new VPS Instance in a `region` with the desired `plan`. Choose one of the following to deploy the instance:  * `os_id` * `iso_id` * `snapshot_id` * `app_id` * `image_id`  Supply other attributes as desired.
   * Create Instance
   */
  async createInstance(
    createInstanceRequest?: CreateInstanceRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateInstance202Response> {
    const response = await this.createInstanceRaw({ createInstanceRequest: createInstanceRequest }, initOverrides);
    return await response.value();
  }

  /**
   * Set the backup schedule for an Instance in UTC. The `type` is required.
   * Set Instance Backup Schedule
   */
  async createInstanceBackupScheduleRaw(
    requestParameters: CreateInstanceBackupScheduleOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling createInstanceBackupSchedule().',
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

    let urlPath = `/instances/{instance-id}/backup-schedule`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateInstanceBackupScheduleRequestToJSON(requestParameters['createInstanceBackupScheduleRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Set the backup schedule for an Instance in UTC. The `type` is required.
   * Set Instance Backup Schedule
   */
  async createInstanceBackupSchedule(
    instanceId: string,
    createInstanceBackupScheduleRequest?: CreateInstanceBackupScheduleRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.createInstanceBackupScheduleRaw(
      { instanceId: instanceId, createInstanceBackupScheduleRequest: createInstanceBackupScheduleRequest },
      initOverrides,
    );
  }

  /**
   * Create an IPv4 address for an Instance.
   * Create IPv4
   */
  async createInstanceIpv4Raw(
    requestParameters: CreateInstanceIpv4OperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<object>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling createInstanceIpv4().',
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

    let urlPath = `/instances/{instance-id}/ipv4`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateInstanceIpv4RequestToJSON(requestParameters['createInstanceIpv4Request']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse<any>(response);
  }

  /**
   * Create an IPv4 address for an Instance.
   * Create IPv4
   */
  async createInstanceIpv4(
    instanceId: string,
    createInstanceIpv4Request?: CreateInstanceIpv4Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<object> {
    const response = await this.createInstanceIpv4Raw(
      { instanceId: instanceId, createInstanceIpv4Request: createInstanceIpv4Request },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Create a reverse IPv4 entry for an Instance. The `ip` and `reverse` attributes are required.
   * Create Instance Reverse IPv4
   */
  async createInstanceReverseIpv4Raw(
    requestParameters: CreateInstanceReverseIpv4Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling createInstanceReverseIpv4().',
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

    let urlPath = `/instances/{instance-id}/ipv4/reverse`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

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
   * Create a reverse IPv4 entry for an Instance. The `ip` and `reverse` attributes are required.
   * Create Instance Reverse IPv4
   */
  async createInstanceReverseIpv4(
    instanceId: string,
    createBaremetalReverseIpv4Request?: CreateBaremetalReverseIpv4Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.createInstanceReverseIpv4Raw(
      { instanceId: instanceId, createBaremetalReverseIpv4Request: createBaremetalReverseIpv4Request },
      initOverrides,
    );
  }

  /**
   * Create a reverse IPv6 entry for an Instance. The `ip` and `reverse` attributes are required. IP address must be in full, expanded format.
   * Create Instance Reverse IPv6
   */
  async createInstanceReverseIpv6Raw(
    requestParameters: CreateInstanceReverseIpv6Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling createInstanceReverseIpv6().',
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

    let urlPath = `/instances/{instance-id}/ipv6/reverse`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

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
   * Create a reverse IPv6 entry for an Instance. The `ip` and `reverse` attributes are required. IP address must be in full, expanded format.
   * Create Instance Reverse IPv6
   */
  async createInstanceReverseIpv6(
    instanceId: string,
    createBaremetalReverseIpv6Request?: CreateBaremetalReverseIpv6Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.createInstanceReverseIpv6Raw(
      { instanceId: instanceId, createBaremetalReverseIpv6Request: createBaremetalReverseIpv6Request },
      initOverrides,
    );
  }

  /**
   * Delete an Instance.
   * Delete Instance
   */
  async deleteInstanceRaw(
    requestParameters: DeleteInstanceRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError('instanceId', 'Required parameter "instanceId" was null or undefined when calling deleteInstance().');
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

    let urlPath = `/instances/{instance-id}`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

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
   * Delete an Instance.
   * Delete Instance
   */
  async deleteInstance(instanceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.deleteInstanceRaw({ instanceId: instanceId }, initOverrides);
  }

  /**
   * Delete an IPv4 address from an Instance.
   * Delete IPv4 Address
   */
  async deleteInstanceIpv4Raw(
    requestParameters: DeleteInstanceIpv4Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling deleteInstanceIpv4().',
      );
    }

    if (requestParameters['ipv4'] == null) {
      throw new runtime.RequiredError('ipv4', 'Required parameter "ipv4" was null or undefined when calling deleteInstanceIpv4().');
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

    let urlPath = `/instances/{instance-id}/ipv4/{ipv4}`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));
    urlPath = urlPath.replace(`{${'ipv4'}}`, encodeURIComponent(String(requestParameters['ipv4'])));

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
   * Delete an IPv4 address from an Instance.
   * Delete IPv4 Address
   */
  async deleteInstanceIpv4(instanceId: string, ipv4: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.deleteInstanceIpv4Raw({ instanceId: instanceId, ipv4: ipv4 }, initOverrides);
  }

  /**
   * Delete the reverse IPv6 for an Instance.
   * Delete Instance Reverse IPv6
   */
  async deleteInstanceReverseIpv6Raw(
    requestParameters: DeleteInstanceReverseIpv6Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling deleteInstanceReverseIpv6().',
      );
    }

    if (requestParameters['ipv6'] == null) {
      throw new runtime.RequiredError('ipv6', 'Required parameter "ipv6" was null or undefined when calling deleteInstanceReverseIpv6().');
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

    let urlPath = `/instances/{instance-id}/ipv6/reverse/{ipv6}`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));
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
   * Delete the reverse IPv6 for an Instance.
   * Delete Instance Reverse IPv6
   */
  async deleteInstanceReverseIpv6(
    instanceId: string,
    ipv6: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.deleteInstanceReverseIpv6Raw({ instanceId: instanceId, ipv6: ipv6 }, initOverrides);
  }

  /**
   * Detach the ISO from an Instance.
   * Detach ISO from instance
   */
  async detachInstanceIsoRaw(
    requestParameters: DetachInstanceIsoRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<DetachInstanceIso202Response>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling detachInstanceIso().',
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

    let urlPath = `/instances/{instance-id}/iso/detach`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => DetachInstanceIso202ResponseFromJSON(jsonValue));
  }

  /**
   * Detach the ISO from an Instance.
   * Detach ISO from instance
   */
  async detachInstanceIso(
    instanceId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<DetachInstanceIso202Response> {
    const response = await this.detachInstanceIsoRaw({ instanceId: instanceId }, initOverrides);
    return await response.value();
  }

  /**
   * Detach Private Network from an Instance.<br><br>**Deprecated**: use [Detach VPC from Instance](#operation/detach-instance-vpc) instead.
   * Detach Private Network from Instance.
   * @deprecated
   */
  async detachInstanceNetworkRaw(
    requestParameters: DetachInstanceNetworkOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling detachInstanceNetwork().',
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

    let urlPath = `/instances/{instance-id}/private-networks/detach`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: DetachInstanceNetworkRequestToJSON(requestParameters['detachInstanceNetworkRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Detach Private Network from an Instance.<br><br>**Deprecated**: use [Detach VPC from Instance](#operation/detach-instance-vpc) instead.
   * Detach Private Network from Instance.
   * @deprecated
   */
  async detachInstanceNetwork(
    instanceId: string,
    detachInstanceNetworkRequest?: DetachInstanceNetworkRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.detachInstanceNetworkRaw(
      { instanceId: instanceId, detachInstanceNetworkRequest: detachInstanceNetworkRequest },
      initOverrides,
    );
  }

  /**
   * Detach a VPC from an Instance.
   * Detach VPC from Instance
   */
  async detachInstanceVpcRaw(
    requestParameters: DetachInstanceVpcOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling detachInstanceVpc().',
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

    let urlPath = `/instances/{instance-id}/vpcs/detach`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: DetachInstanceVpcRequestToJSON(requestParameters['detachInstanceVpcRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Detach a VPC from an Instance.
   * Detach VPC from Instance
   */
  async detachInstanceVpc(
    instanceId: string,
    detachInstanceVpcRequest?: DetachInstanceVpcRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.detachInstanceVpcRaw({ instanceId: instanceId, detachInstanceVpcRequest: detachInstanceVpcRequest }, initOverrides);
  }

  /**
   * Detach a VPC 2.0 Network from an Instance.<br><br>**Deprecated**: Migrate to VPC Networks and use [Detach VPC from Instance](#operation/detach-instance-vpc) instead.
   * Detach VPC 2.0 Network from Instance
   * @deprecated
   */
  async detachInstanceVpc2Raw(
    requestParameters: DetachInstanceVpc2OperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling detachInstanceVpc2().',
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

    let urlPath = `/instances/{instance-id}/vpc2/detach`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: DetachInstanceVpc2RequestToJSON(requestParameters['detachInstanceVpc2Request']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Detach a VPC 2.0 Network from an Instance.<br><br>**Deprecated**: Migrate to VPC Networks and use [Detach VPC from Instance](#operation/detach-instance-vpc) instead.
   * Detach VPC 2.0 Network from Instance
   * @deprecated
   */
  async detachInstanceVpc2(
    instanceId: string,
    detachInstanceVpc2Request?: DetachInstanceVpc2Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.detachInstanceVpc2Raw({ instanceId: instanceId, detachInstanceVpc2Request: detachInstanceVpc2Request }, initOverrides);
  }

  /**
   * Get information about an Instance.
   * Get Instance
   */
  async getInstanceRaw(
    requestParameters: GetInstanceRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetInstance200Response>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError('instanceId', 'Required parameter "instanceId" was null or undefined when calling getInstance().');
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

    let urlPath = `/instances/{instance-id}`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetInstance200ResponseFromJSON(jsonValue));
  }

  /**
   * Get information about an Instance.
   * Get Instance
   */
  async getInstance(instanceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetInstance200Response> {
    const response = await this.getInstanceRaw({ instanceId: instanceId }, initOverrides);
    return await response.value();
  }

  /**
   * Get the backup schedule for an Instance.
   * Get Instance Backup Schedule
   */
  async getInstanceBackupScheduleRaw(
    requestParameters: GetInstanceBackupScheduleRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetInstanceBackupSchedule200Response>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling getInstanceBackupSchedule().',
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

    let urlPath = `/instances/{instance-id}/backup-schedule`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetInstanceBackupSchedule200ResponseFromJSON(jsonValue));
  }

  /**
   * Get the backup schedule for an Instance.
   * Get Instance Backup Schedule
   */
  async getInstanceBackupSchedule(
    instanceId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetInstanceBackupSchedule200Response> {
    const response = await this.getInstanceBackupScheduleRaw({ instanceId: instanceId }, initOverrides);
    return await response.value();
  }

  /**
   * Get bandwidth information about an Instance.<br><br>The `bandwidth` object in a successful response contains objects representing a day in the month. The date is denoted by the nested object keys. Days begin and end in the UTC timezone. The bandwidth utilization data contained within the date object is refreshed periodically. We do not recommend using this endpoint to gather real-time metrics.
   * Instance Bandwidth
   */
  async getInstanceBandwidthRaw(
    requestParameters: GetInstanceBandwidthRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetBandwidthBaremetal200Response>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling getInstanceBandwidth().',
      );
    }

    const queryParameters: any = {};

    if (requestParameters['dateRange'] != null) {
      queryParameters['date_range'] = requestParameters['dateRange'];
    }

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/instances/{instance-id}/bandwidth`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

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
   * Get bandwidth information about an Instance.<br><br>The `bandwidth` object in a successful response contains objects representing a day in the month. The date is denoted by the nested object keys. Days begin and end in the UTC timezone. The bandwidth utilization data contained within the date object is refreshed periodically. We do not recommend using this endpoint to gather real-time metrics.
   * Instance Bandwidth
   */
  async getInstanceBandwidth(
    instanceId: string,
    dateRange?: number,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetBandwidthBaremetal200Response> {
    const response = await this.getInstanceBandwidthRaw({ instanceId: instanceId, dateRange: dateRange }, initOverrides);
    return await response.value();
  }

  /**
   * List the IPv4 information for an Instance.
   * List Instance IPv4 Information
   */
  async getInstanceIpv4Raw(
    requestParameters: GetInstanceIpv4Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetIpv4Baremetal200Response>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling getInstanceIpv4().',
      );
    }

    const queryParameters: any = {};

    if (requestParameters['publicNetwork'] != null) {
      queryParameters['public_network'] = requestParameters['publicNetwork'];
    }

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

    let urlPath = `/instances/{instance-id}/ipv4`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

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
   * List the IPv4 information for an Instance.
   * List Instance IPv4 Information
   */
  async getInstanceIpv4(
    instanceId: string,
    publicNetwork?: boolean,
    perPage?: number,
    cursor?: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetIpv4Baremetal200Response> {
    const response = await this.getInstanceIpv4Raw(
      { instanceId: instanceId, publicNetwork: publicNetwork, perPage: perPage, cursor: cursor },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Get the IPv6 information for an VPS Instance.
   * Get Instance IPv6 Information
   */
  async getInstanceIpv6Raw(
    requestParameters: GetInstanceIpv6Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetIpv6Baremetal200Response>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling getInstanceIpv6().',
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

    let urlPath = `/instances/{instance-id}/ipv6`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

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
   * Get the IPv6 information for an VPS Instance.
   * Get Instance IPv6 Information
   */
  async getInstanceIpv6(
    instanceId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetIpv6Baremetal200Response> {
    const response = await this.getInstanceIpv6Raw({ instanceId: instanceId }, initOverrides);
    return await response.value();
  }

  /**
   * Get the ISO status for an Instance.
   * Get Instance ISO Status
   */
  async getInstanceIsoStatusRaw(
    requestParameters: GetInstanceIsoStatusRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetInstanceIsoStatus200Response>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling getInstanceIsoStatus().',
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

    let urlPath = `/instances/{instance-id}/iso`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetInstanceIsoStatus200ResponseFromJSON(jsonValue));
  }

  /**
   * Get the ISO status for an Instance.
   * Get Instance ISO Status
   */
  async getInstanceIsoStatus(
    instanceId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetInstanceIsoStatus200Response> {
    const response = await this.getInstanceIsoStatusRaw({ instanceId: instanceId }, initOverrides);
    return await response.value();
  }

  /**
   * Get available information for an Instance job
   * Get Instance Job
   */
  async getInstanceJobRaw(
    requestParameters: GetInstanceJobRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetInstanceJob200Response>> {
    if (requestParameters['jobId'] == null) {
      throw new runtime.RequiredError('jobId', 'Required parameter "jobId" was null or undefined when calling getInstanceJob().');
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

    let urlPath = `/instances/jobs/{job-id}`;
    urlPath = urlPath.replace(`{${'job-id'}}`, encodeURIComponent(String(requestParameters['jobId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetInstanceJob200ResponseFromJSON(jsonValue));
  }

  /**
   * Get available information for an Instance job
   * Get Instance Job
   */
  async getInstanceJob(jobId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetInstanceJob200Response> {
    const response = await this.getInstanceJobRaw({ jobId: jobId }, initOverrides);
    return await response.value();
  }

  /**
   * Get a list of other instances in the same location as this Instance.
   * Get Instance neighbors
   */
  async getInstanceNeighborsRaw(
    requestParameters: GetInstanceNeighborsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetInstanceNeighbors200Response>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling getInstanceNeighbors().',
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

    let urlPath = `/instances/{instance-id}/neighbors`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetInstanceNeighbors200ResponseFromJSON(jsonValue));
  }

  /**
   * Get a list of other instances in the same location as this Instance.
   * Get Instance neighbors
   */
  async getInstanceNeighbors(
    instanceId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetInstanceNeighbors200Response> {
    const response = await this.getInstanceNeighborsRaw({ instanceId: instanceId }, initOverrides);
    return await response.value();
  }

  /**
   * Get available upgrades for an Instance
   * Get Available Instance Upgrades
   */
  async getInstanceUpgradesRaw(
    requestParameters: GetInstanceUpgradesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetInstanceUpgrades200Response>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling getInstanceUpgrades().',
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

    let urlPath = `/instances/{instance-id}/upgrades`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetInstanceUpgrades200ResponseFromJSON(jsonValue));
  }

  /**
   * Get available upgrades for an Instance
   * Get Available Instance Upgrades
   */
  async getInstanceUpgrades(
    instanceId: string,
    type?: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetInstanceUpgrades200Response> {
    const response = await this.getInstanceUpgradesRaw({ instanceId: instanceId, type: type }, initOverrides);
    return await response.value();
  }

  /**
   * Get the user-supplied, base64 encoded [user data](https://docs.vultr.com/manage-instance-user-data-with-the-vultr-metadata-api/) for an Instance.
   * Get Instance User Data
   */
  async getInstanceUserdataRaw(
    requestParameters: GetInstanceUserdataRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetInstanceUserdata200Response>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling getInstanceUserdata().',
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

    let urlPath = `/instances/{instance-id}/user-data`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetInstanceUserdata200ResponseFromJSON(jsonValue));
  }

  /**
   * Get the user-supplied, base64 encoded [user data](https://docs.vultr.com/manage-instance-user-data-with-the-vultr-metadata-api/) for an Instance.
   * Get Instance User Data
   */
  async getInstanceUserdata(
    instanceId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetInstanceUserdata200Response> {
    const response = await this.getInstanceUserdataRaw({ instanceId: instanceId }, initOverrides);
    return await response.value();
  }

  /**
   * Halt an Instance.
   * Halt Instance
   */
  async haltInstanceRaw(
    requestParameters: HaltInstanceRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError('instanceId', 'Required parameter "instanceId" was null or undefined when calling haltInstance().');
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

    let urlPath = `/instances/{instance-id}/halt`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

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
   * Halt an Instance.
   * Halt Instance
   */
  async haltInstance(instanceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.haltInstanceRaw({ instanceId: instanceId }, initOverrides);
  }

  /**
   * Halt Instances.
   * Halt Instances
   */
  async haltInstancesRaw(
    requestParameters: HaltInstancesOperationRequest,
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

    let urlPath = `/instances/halt`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: HaltInstancesRequestToJSON(requestParameters['haltInstancesRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Halt Instances.
   * Halt Instances
   */
  async haltInstances(
    haltInstancesRequest?: HaltInstancesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.haltInstancesRaw({ haltInstancesRequest: haltInstancesRequest }, initOverrides);
  }

  /**
   * List the reverse IPv6 information for an Instance.
   * List Instance IPv6 Reverse
   */
  async listInstanceIpv6ReverseRaw(
    requestParameters: ListInstanceIpv6ReverseRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListInstanceIpv6Reverse200Response>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling listInstanceIpv6Reverse().',
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

    let urlPath = `/instances/{instance-id}/ipv6/reverse`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListInstanceIpv6Reverse200ResponseFromJSON(jsonValue));
  }

  /**
   * List the reverse IPv6 information for an Instance.
   * List Instance IPv6 Reverse
   */
  async listInstanceIpv6Reverse(
    instanceId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListInstanceIpv6Reverse200Response> {
    const response = await this.listInstanceIpv6ReverseRaw({ instanceId: instanceId }, initOverrides);
    return await response.value();
  }

  /**
   * **Deprecated**: use [List Instance VPCs](#operation/list-instance-vpcs) instead.<br><br>List the private networks for an Instance.
   * List instance Private Networks
   * @deprecated
   */
  async listInstancePrivateNetworksRaw(
    requestParameters: ListInstancePrivateNetworksRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListInstancePrivateNetworks200Response>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling listInstancePrivateNetworks().',
      );
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

    let urlPath = `/instances/{instance-id}/private-networks`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListInstancePrivateNetworks200ResponseFromJSON(jsonValue));
  }

  /**
   * **Deprecated**: use [List Instance VPCs](#operation/list-instance-vpcs) instead.<br><br>List the private networks for an Instance.
   * List instance Private Networks
   * @deprecated
   */
  async listInstancePrivateNetworks(
    instanceId: string,
    perPage?: number,
    cursor?: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListInstancePrivateNetworks200Response> {
    const response = await this.listInstancePrivateNetworksRaw({ instanceId: instanceId, perPage: perPage, cursor: cursor }, initOverrides);
    return await response.value();
  }

  /**
   * List the VPC 2.0 networks for an Instance.<br><br>**Deprecated**: Migrate to VPC Networks and use [List Instance VPCs](#operation/list-instance-vpcs) instead.
   * List Instance VPC 2.0 Networks
   * @deprecated
   */
  async listInstanceVpc2Raw(
    requestParameters: ListInstanceVpc2Request,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListInstanceVpc2200Response>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling listInstanceVpc2().',
      );
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

    let urlPath = `/instances/{instance-id}/vpc2`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListInstanceVpc2200ResponseFromJSON(jsonValue));
  }

  /**
   * List the VPC 2.0 networks for an Instance.<br><br>**Deprecated**: Migrate to VPC Networks and use [List Instance VPCs](#operation/list-instance-vpcs) instead.
   * List Instance VPC 2.0 Networks
   * @deprecated
   */
  async listInstanceVpc2(
    instanceId: string,
    perPage?: number,
    cursor?: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListInstanceVpc2200Response> {
    const response = await this.listInstanceVpc2Raw({ instanceId: instanceId, perPage: perPage, cursor: cursor }, initOverrides);
    return await response.value();
  }

  /**
   * List the VPCs for an Instance.
   * List instance VPCs
   */
  async listInstanceVpcsRaw(
    requestParameters: ListInstanceVpcsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListInstanceVpcs200Response>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling listInstanceVpcs().',
      );
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

    let urlPath = `/instances/{instance-id}/vpcs`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListInstanceVpcs200ResponseFromJSON(jsonValue));
  }

  /**
   * List the VPCs for an Instance.
   * List instance VPCs
   */
  async listInstanceVpcs(
    instanceId: string,
    perPage?: number,
    cursor?: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListInstanceVpcs200Response> {
    const response = await this.listInstanceVpcsRaw({ instanceId: instanceId, perPage: perPage, cursor: cursor }, initOverrides);
    return await response.value();
  }

  /**
   * List all VPS instances in your account.
   * List Instances
   */
  async listInstancesRaw(
    requestParameters: ListInstancesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListInstances200Response>> {
    const queryParameters: any = {};

    if (requestParameters['perPage'] != null) {
      queryParameters['per_page'] = requestParameters['perPage'];
    }

    if (requestParameters['cursor'] != null) {
      queryParameters['cursor'] = requestParameters['cursor'];
    }

    if (requestParameters['tag'] != null) {
      queryParameters['tag'] = requestParameters['tag'];
    }

    if (requestParameters['label'] != null) {
      queryParameters['label'] = requestParameters['label'];
    }

    if (requestParameters['mainIp'] != null) {
      queryParameters['main_ip'] = requestParameters['mainIp'];
    }

    if (requestParameters['region'] != null) {
      queryParameters['region'] = requestParameters['region'];
    }

    if (requestParameters['firewallGroupId'] != null) {
      queryParameters['firewall_group_id'] = requestParameters['firewallGroupId'];
    }

    if (requestParameters['hostname'] != null) {
      queryParameters['hostname'] = requestParameters['hostname'];
    }

    if (requestParameters['showPendingCharges'] != null) {
      queryParameters['show_pending_charges'] = requestParameters['showPendingCharges'];
    }

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/instances`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListInstances200ResponseFromJSON(jsonValue));
  }

  /**
   * List all VPS instances in your account.
   * List Instances
   */
  async listInstances(
    perPage?: number,
    cursor?: string,
    tag?: string,
    label?: string,
    mainIp?: string,
    region?: string,
    firewallGroupId?: string,
    hostname?: string,
    showPendingCharges?: boolean,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListInstances200Response> {
    const response = await this.listInstancesRaw(
      {
        perPage: perPage,
        cursor: cursor,
        tag: tag,
        label: label,
        mainIp: mainIp,
        region: region,
        firewallGroupId: firewallGroupId,
        hostname: hostname,
        showPendingCharges: showPendingCharges,
      },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Set a reverse DNS entry for an IPv4 address
   * Set Default Reverse DNS Entry
   */
  async postInstancesInstanceIdIpv4ReverseDefaultRaw(
    requestParameters: PostInstancesInstanceIdIpv4ReverseDefaultRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling postInstancesInstanceIdIpv4ReverseDefault().',
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

    let urlPath = `/instances/{instance-id}/ipv4/reverse/default`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

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
  async postInstancesInstanceIdIpv4ReverseDefault(
    instanceId: string,
    postBaremetalInstanceIdIpv4ReverseDefaultRequest?: PostBaremetalInstanceIdIpv4ReverseDefaultRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.postInstancesInstanceIdIpv4ReverseDefaultRaw(
      { instanceId: instanceId, postBaremetalInstanceIdIpv4ReverseDefaultRequest: postBaremetalInstanceIdIpv4ReverseDefaultRequest },
      initOverrides,
    );
  }

  /**
   * Reboot an Instance.
   * Reboot Instance
   */
  async rebootInstanceRaw(
    requestParameters: RebootInstanceRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError('instanceId', 'Required parameter "instanceId" was null or undefined when calling rebootInstance().');
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

    let urlPath = `/instances/{instance-id}/reboot`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

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
   * Reboot an Instance.
   * Reboot Instance
   */
  async rebootInstance(instanceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.rebootInstanceRaw({ instanceId: instanceId }, initOverrides);
  }

  /**
   * Reboot Instances.
   * Reboot instances
   */
  async rebootInstancesRaw(
    requestParameters: RebootInstancesOperationRequest,
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

    let urlPath = `/instances/reboot`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: RebootInstancesRequestToJSON(requestParameters['rebootInstancesRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Reboot Instances.
   * Reboot instances
   */
  async rebootInstances(
    rebootInstancesRequest?: RebootInstancesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.rebootInstancesRaw({ rebootInstancesRequest: rebootInstancesRequest }, initOverrides);
  }

  /**
   * Reinstall an Instance using an optional `hostname`.  **Note:** This action may take a few extra seconds to complete.
   * Reinstall Instance
   */
  async reinstallInstanceRaw(
    requestParameters: ReinstallInstanceOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateInstance202Response>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling reinstallInstance().',
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

    let urlPath = `/instances/{instance-id}/reinstall`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: ReinstallInstanceRequestToJSON(requestParameters['reinstallInstanceRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateInstance202ResponseFromJSON(jsonValue));
  }

  /**
   * Reinstall an Instance using an optional `hostname`.  **Note:** This action may take a few extra seconds to complete.
   * Reinstall Instance
   */
  async reinstallInstance(
    instanceId: string,
    reinstallInstanceRequest?: ReinstallInstanceRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateInstance202Response> {
    const response = await this.reinstallInstanceRaw(
      { instanceId: instanceId, reinstallInstanceRequest: reinstallInstanceRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Restore an Instance from either `backup_id` or `snapshot_id`.
   * Restore Instance
   */
  async restoreInstanceRaw(
    requestParameters: RestoreInstanceOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<RestoreInstance202Response>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError(
        'instanceId',
        'Required parameter "instanceId" was null or undefined when calling restoreInstance().',
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

    let urlPath = `/instances/{instance-id}/restore`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: RestoreInstanceRequestToJSON(requestParameters['restoreInstanceRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => RestoreInstance202ResponseFromJSON(jsonValue));
  }

  /**
   * Restore an Instance from either `backup_id` or `snapshot_id`.
   * Restore Instance
   */
  async restoreInstance(
    instanceId: string,
    restoreInstanceRequest?: RestoreInstanceRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<RestoreInstance202Response> {
    const response = await this.restoreInstanceRaw(
      { instanceId: instanceId, restoreInstanceRequest: restoreInstanceRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Start an Instance.
   * Start instance
   */
  async startInstanceRaw(
    requestParameters: StartInstanceRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError('instanceId', 'Required parameter "instanceId" was null or undefined when calling startInstance().');
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

    let urlPath = `/instances/{instance-id}/start`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

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
   * Start an Instance.
   * Start instance
   */
  async startInstance(instanceId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.startInstanceRaw({ instanceId: instanceId }, initOverrides);
  }

  /**
   * Start Instances.
   * Start instances
   */
  async startInstancesRaw(
    requestParameters: StartInstancesOperationRequest,
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

    let urlPath = `/instances/start`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: StartInstancesRequestToJSON(requestParameters['startInstancesRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Start Instances.
   * Start instances
   */
  async startInstances(
    startInstancesRequest?: StartInstancesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.startInstancesRaw({ startInstancesRequest: startInstancesRequest }, initOverrides);
  }

  /**
   * Update information for an Instance. All attributes are optional. If not set, the attributes will retain their original values.  **Note:** Changing `os_id`, `app_id` or `image_id` may take a few extra seconds to complete.
   * Update Instance
   */
  async updateInstanceRaw(
    requestParameters: UpdateInstanceOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateInstance202Response>> {
    if (requestParameters['instanceId'] == null) {
      throw new runtime.RequiredError('instanceId', 'Required parameter "instanceId" was null or undefined when calling updateInstance().');
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

    let urlPath = `/instances/{instance-id}`;
    urlPath = urlPath.replace(`{${'instance-id'}}`, encodeURIComponent(String(requestParameters['instanceId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PATCH',
        headers: headerParameters,
        query: queryParameters,
        body: UpdateInstanceRequestToJSON(requestParameters['updateInstanceRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateInstance202ResponseFromJSON(jsonValue));
  }

  /**
   * Update information for an Instance. All attributes are optional. If not set, the attributes will retain their original values.  **Note:** Changing `os_id`, `app_id` or `image_id` may take a few extra seconds to complete.
   * Update Instance
   */
  async updateInstance(
    instanceId: string,
    updateInstanceRequest?: UpdateInstanceRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateInstance202Response> {
    const response = await this.updateInstanceRaw({ instanceId: instanceId, updateInstanceRequest: updateInstanceRequest }, initOverrides);
    return await response.value();
  }
}
