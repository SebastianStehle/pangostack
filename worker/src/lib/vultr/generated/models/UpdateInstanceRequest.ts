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

import { mapValues } from '../runtime';
/**
 *
 * @export
 * @interface UpdateInstanceRequest
 */
export interface UpdateInstanceRequest {
  /**
   * Reinstall the instance with this [Application id](#operation/list-applications).
   * @type {number}
   * @memberof UpdateInstanceRequest
   */
  appId?: number;
  /**
   * Reinstall the instance with this [Application image_id](#operation/list-applications).
   * @type {string}
   * @memberof UpdateInstanceRequest
   */
  imageId?: string;
  /**
   * Enable automatic backups for the instance.
   *
   * * enabled
   * * disabled
   * @type {string}
   * @memberof UpdateInstanceRequest
   */
  backups?: string;
  /**
   * The [Firewall Group id](#operation/list-firewall-groups) to attach to this Instance.
   * @type {string}
   * @memberof UpdateInstanceRequest
   */
  firewallGroupId?: string;
  /**
   * Enable IPv6.
   *
   * * true
   * @type {boolean}
   * @memberof UpdateInstanceRequest
   */
  enableIpv6?: boolean;
  /**
   * Reinstall the instance with this [ISO id](#operation/list-isos).
   * @type {string}
   * @memberof UpdateInstanceRequest
   */
  osId?: string;
  /**
   * The user-supplied, base64 encoded [user data](https://docs.vultr.com/manage-instance-user-data-with-the-vultr-metadata-api/) to attach to this instance.
   * @type {string}
   * @memberof UpdateInstanceRequest
   */
  userData?: string;
  /**
   * Use `tags` instead. The user-supplied tag.
   * @type {string}
   * @memberof UpdateInstanceRequest
   * @deprecated
   */
  tag?: string;
  /**
   * Upgrade the instance with this [Plan id](#operation/list-plans).
   * @type {string}
   * @memberof UpdateInstanceRequest
   */
  plan?: string;
  /**
   * Enable DDoS Protection (there is an additional charge for this).
   *
   * * true
   * * false
   * @type {boolean}
   * @memberof UpdateInstanceRequest
   */
  ddosProtection?: boolean;
  /**
   * Use `attach_vpc` instead. An array of [Private Network ids](#operation/list-networks) to attach to this Instance. This parameter takes precedence over `enable_private_network`. Please choose one parameter.
   * @type {Array<string>}
   * @memberof UpdateInstanceRequest
   * @deprecated
   */
  attachPrivateNetwork?: Array<string>;
  /**
   * An array of [VPC IDs](#operation/list-vpcs) to attach to this Instance. This parameter takes precedence over `enable_vpc`. Please choose one parameter.
   * @type {Array<string>}
   * @memberof UpdateInstanceRequest
   */
  attachVpc?: Array<string>;
  /**
   * Use `attach_vpc` instead. An array of [VPC IDs](#operation/list-vpc2) to attach to this Instance. This parameter takes precedence over `enable_vpc2`. Please choose one parameter.
   * @type {Array<string>}
   * @memberof UpdateInstanceRequest
   * @deprecated
   */
  attachVpc2?: Array<string>;
  /**
   * Use `detach_vpc` instead. An array of [Private Network ids](#operation/list-networks) to detach from this Instance. This parameter takes precedence over `enable_private_network`.
   * @type {Array<string>}
   * @memberof UpdateInstanceRequest
   * @deprecated
   */
  detachPrivateNetwork?: Array<string>;
  /**
   * An array of [VPC IDs](#operation/list-vpcs) to detach from this Instance. This parameter takes precedence over `enable_vpc`.
   * @type {Array<string>}
   * @memberof UpdateInstanceRequest
   */
  detachVpc?: Array<string>;
  /**
   * Use `detach_vpc` instead. An array of [VPC IDs](#operation/list-vpc2) to detach from this Instance. This parameter takes precedence over `enable_vpc2`.
   * @type {Array<string>}
   * @memberof UpdateInstanceRequest
   * @deprecated
   */
  detachVpc2?: Array<string>;
  /**
   * Use `enable_vpc` instead.
   *
   * If `true`, private networking support will be added to the new server.
   *
   * This parameter attaches a single network. When no network exists in the region, it will be automatically created.
   *
   * If there are multiple private networks in the instance's region, use `attach_private_network` instead to specify a network.
   * @type {boolean}
   * @memberof UpdateInstanceRequest
   * @deprecated
   */
  enablePrivateNetwork?: boolean;
  /**
   * If `true`, VPC support will be added to the new server.
   *
   * This parameter attaches a single VPC. When no VPC exists in the region, it will be automatically created.
   *
   * If there are multiple VPCs in the instance's region, use `attach_vpc` instead to specify a VPC.
   * @type {boolean}
   * @memberof UpdateInstanceRequest
   */
  enableVpc?: boolean;
  /**
   * Use `enable_vpc` instead.
   *
   * If `true`, VPC 2.0 support will be added to the new server.
   *
   * This parameter attaches a single VPC 2.0 network. When no VPC 2.0 network exists in the region, it will be automatically created.
   *
   * If there are multiple VPC 2.0 networks in the instance's region, use `attach_vpc2` instead to specify a VPC 2.0 network.
   * @type {boolean}
   * @memberof UpdateInstanceRequest
   * @deprecated
   */
  enableVpc2?: boolean;
  /**
   * The user supplied label.
   * @type {string}
   * @memberof UpdateInstanceRequest
   */
  label?: string;
  /**
   * Tags to apply to the instance.
   * @type {Array<string>}
   * @memberof UpdateInstanceRequest
   */
  tags?: Array<string>;
  /**
   * Linux-only: The user scheme used for logging into this instance. The instance must be reinstalled for this change to take effect.
   *
   * * root
   * * limited
   * @type {string}
   * @memberof UpdateInstanceRequest
   */
  userScheme?: string;
}

/**
 * Check if a given object implements the UpdateInstanceRequest interface.
 */
export function instanceOfUpdateInstanceRequest(value: object): value is UpdateInstanceRequest {
  return true;
}

export function UpdateInstanceRequestFromJSON(json: any): UpdateInstanceRequest {
  return UpdateInstanceRequestFromJSONTyped(json, false);
}

export function UpdateInstanceRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): UpdateInstanceRequest {
  if (json == null) {
    return json;
  }
  return {
    appId: json['app_id'] == null ? undefined : json['app_id'],
    imageId: json['image_id'] == null ? undefined : json['image_id'],
    backups: json['backups'] == null ? undefined : json['backups'],
    firewallGroupId: json['firewall_group_id'] == null ? undefined : json['firewall_group_id'],
    enableIpv6: json['enable_ipv6'] == null ? undefined : json['enable_ipv6'],
    osId: json['os_id'] == null ? undefined : json['os_id'],
    userData: json['user_data'] == null ? undefined : json['user_data'],
    tag: json['tag'] == null ? undefined : json['tag'],
    plan: json['plan'] == null ? undefined : json['plan'],
    ddosProtection: json['ddos_protection'] == null ? undefined : json['ddos_protection'],
    attachPrivateNetwork: json['attach_private_network'] == null ? undefined : json['attach_private_network'],
    attachVpc: json['attach_vpc'] == null ? undefined : json['attach_vpc'],
    attachVpc2: json['attach_vpc2'] == null ? undefined : json['attach_vpc2'],
    detachPrivateNetwork: json['detach_private_network'] == null ? undefined : json['detach_private_network'],
    detachVpc: json['detach_vpc'] == null ? undefined : json['detach_vpc'],
    detachVpc2: json['detach_vpc2'] == null ? undefined : json['detach_vpc2'],
    enablePrivateNetwork: json['enable_private_network'] == null ? undefined : json['enable_private_network'],
    enableVpc: json['enable_vpc'] == null ? undefined : json['enable_vpc'],
    enableVpc2: json['enable_vpc2'] == null ? undefined : json['enable_vpc2'],
    label: json['label'] == null ? undefined : json['label'],
    tags: json['tags'] == null ? undefined : json['tags'],
    userScheme: json['user_scheme'] == null ? undefined : json['user_scheme'],
  };
}

export function UpdateInstanceRequestToJSON(json: any): UpdateInstanceRequest {
  return UpdateInstanceRequestToJSONTyped(json, false);
}

export function UpdateInstanceRequestToJSONTyped(value?: UpdateInstanceRequest | null, ignoreDiscriminator: boolean = false): any {
  if (value == null) {
    return value;
  }

  return {
    app_id: value['appId'],
    image_id: value['imageId'],
    backups: value['backups'],
    firewall_group_id: value['firewallGroupId'],
    enable_ipv6: value['enableIpv6'],
    os_id: value['osId'],
    user_data: value['userData'],
    tag: value['tag'],
    plan: value['plan'],
    ddos_protection: value['ddosProtection'],
    attach_private_network: value['attachPrivateNetwork'],
    attach_vpc: value['attachVpc'],
    attach_vpc2: value['attachVpc2'],
    detach_private_network: value['detachPrivateNetwork'],
    detach_vpc: value['detachVpc'],
    detach_vpc2: value['detachVpc2'],
    enable_private_network: value['enablePrivateNetwork'],
    enable_vpc: value['enableVpc'],
    enable_vpc2: value['enableVpc2'],
    label: value['label'],
    tags: value['tags'],
    user_scheme: value['userScheme'],
  };
}
