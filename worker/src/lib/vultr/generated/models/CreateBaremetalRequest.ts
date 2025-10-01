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
 * @interface CreateBaremetalRequest
 */
export interface CreateBaremetalRequest {
  /**
   * The [Region id](#operation/list-regions) to create the instance.
   * @type {string}
   * @memberof CreateBaremetalRequest
   */
  region: string;
  /**
   * The [Bare Metal plan id](#operation/list-metal-plans) to use for this instance.
   * @type {string}
   * @memberof CreateBaremetalRequest
   */
  plan: string;
  /**
   * The [Startup Script id](#operation/list-startup-scripts) to use for this instance.
   * @type {string}
   * @memberof CreateBaremetalRequest
   */
  scriptId?: string;
  /**
   * Enable IPv6.
   *
   * * true
   * @type {boolean}
   * @memberof CreateBaremetalRequest
   */
  enableIpv6?: boolean;
  /**
   * The [SSH Key id](#operation/list-ssh-keys) to install on this instance.
   * @type {Array<string>}
   * @memberof CreateBaremetalRequest
   */
  sshkeyId?: Array<string>;
  /**
   * The user-supplied, base64 encoded [user data](https://docs.vultr.com/manage-instance-user-data-with-the-vultr-metadata-api/) for this Instance.
   * @type {string}
   * @memberof CreateBaremetalRequest
   */
  userData?: string;
  /**
   * The user-supplied label.
   * @type {string}
   * @memberof CreateBaremetalRequest
   */
  label?: string;
  /**
   * Notify by email after deployment.
   *
   * * true
   * * false (default)
   * @type {boolean}
   * @memberof CreateBaremetalRequest
   */
  activationEmail?: boolean;
  /**
   * The user-supplied hostname to use when deploying this instance.
   * @type {string}
   * @memberof CreateBaremetalRequest
   */
  hostname?: string;
  /**
   * Use `tags` instead. The user-supplied tag.
   * @type {string}
   * @memberof CreateBaremetalRequest
   * @deprecated
   */
  tag?: string;
  /**
   * The [Reserved IP id](#operation/list-reserved-ips) for this instance.
   * @type {string}
   * @memberof CreateBaremetalRequest
   */
  reservedIpv4?: string;
  /**
   * If supplied, deploy the instance using this [Operating System id](#operation/list-os).
   * @type {number}
   * @memberof CreateBaremetalRequest
   */
  osId?: number;
  /**
   * If supplied, deploy the instance using this [Snapshot ID](#operation/list-snapshots).
   * @type {string}
   * @memberof CreateBaremetalRequest
   */
  snapshotId?: string;
  /**
   * If supplied, deploy the instance using this [Application id](#operation/list-applications).
   * @type {number}
   * @memberof CreateBaremetalRequest
   */
  appId?: number;
  /**
   * If supplied, deploy the instance using this [Application image_id](#operation/list-applications).
   * @type {string}
   * @memberof CreateBaremetalRequest
   */
  imageId?: string;
  /**
   * The URL location of the iPXE chainloader. If used, `os_id` must be set to 159.
   * @type {string}
   * @memberof CreateBaremetalRequest
   */
  ipxeChainUrl?: string;
  /**
   * Enable persistent PXE.
   *
   * * true
   * * false (default)
   * @type {boolean}
   * @memberof CreateBaremetalRequest
   */
  persistentPxe?: boolean;
  /**
   * An array of [VPC IDs](#operation/list-vpc2) to attach to this Bare Metal Instance. This parameter takes precedence over `enable_vpc2`. Please choose one parameter.
   * @type {Array<string>}
   * @memberof CreateBaremetalRequest
   * @deprecated
   */
  attachVpc2?: Array<string>;
  /**
   * An array of [VPC IDs](#operation/list-vpc2) to detach from this Bare Metal Instance. This parameter takes precedence over `enable_vpc2`.
   * @type {Array<string>}
   * @memberof CreateBaremetalRequest
   * @deprecated
   */
  detachVpc2?: Array<string>;
  /**
   * If `true`, VPC 2.0 support will be added to the new server.
   *
   * This parameter attaches a single VPC 2.0 network. When no VPC 2.0 network exists in the region, it will be automatically created.
   *
   * If there are multiple VPC 2.0 networks in the instance's region, use `attach_vpc2` instead to specify a VPC 2.0 network.
   * @type {boolean}
   * @memberof CreateBaremetalRequest
   * @deprecated
   */
  enableVpc2?: boolean;
  /**
   * Tags to apply to the instance.
   * @type {Array<string>}
   * @memberof CreateBaremetalRequest
   */
  tags?: Array<string>;
  /**
   * Linux-only: The user scheme used for logging into this instance. By default, the "root" user is configured. Alternatively, a limited user with sudo permissions can be selected.
   *
   * * root
   * * limited
   * @type {string}
   * @memberof CreateBaremetalRequest
   */
  userScheme?: string;
  /**
   * The RAID configuration used for the disks on this instance. The instance must be reinstalled for this change to take effect.
   *
   * * raid1
   * * jbod
   * * none (default)
   * @type {string}
   * @memberof CreateBaremetalRequest
   */
  mdiskMode?: string;
  /**
   * The [app variable inputs](#operation/list-marketplace-app-variables) for configuring the marketplace app (name/value pairs).
   * @type {object}
   * @memberof CreateBaremetalRequest
   */
  appVariables?: object;
}

/**
 * Check if a given object implements the CreateBaremetalRequest interface.
 */
export function instanceOfCreateBaremetalRequest(value: object): value is CreateBaremetalRequest {
  if (!('region' in value) || value['region'] === undefined) return false;
  if (!('plan' in value) || value['plan'] === undefined) return false;
  return true;
}

export function CreateBaremetalRequestFromJSON(json: any): CreateBaremetalRequest {
  return CreateBaremetalRequestFromJSONTyped(json, false);
}

export function CreateBaremetalRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateBaremetalRequest {
  if (json == null) {
    return json;
  }
  return {
    region: json['region'],
    plan: json['plan'],
    scriptId: json['script_id'] == null ? undefined : json['script_id'],
    enableIpv6: json['enable_ipv6'] == null ? undefined : json['enable_ipv6'],
    sshkeyId: json['sshkey_id'] == null ? undefined : json['sshkey_id'],
    userData: json['user_data'] == null ? undefined : json['user_data'],
    label: json['label'] == null ? undefined : json['label'],
    activationEmail: json['activation_email'] == null ? undefined : json['activation_email'],
    hostname: json['hostname'] == null ? undefined : json['hostname'],
    tag: json['tag'] == null ? undefined : json['tag'],
    reservedIpv4: json['reserved_ipv4'] == null ? undefined : json['reserved_ipv4'],
    osId: json['os_id'] == null ? undefined : json['os_id'],
    snapshotId: json['snapshot_id'] == null ? undefined : json['snapshot_id'],
    appId: json['app_id'] == null ? undefined : json['app_id'],
    imageId: json['image_id'] == null ? undefined : json['image_id'],
    ipxeChainUrl: json['ipxe_chain_url'] == null ? undefined : json['ipxe_chain_url'],
    persistentPxe: json['persistent_pxe'] == null ? undefined : json['persistent_pxe'],
    attachVpc2: json['attach_vpc2'] == null ? undefined : json['attach_vpc2'],
    detachVpc2: json['detach_vpc2'] == null ? undefined : json['detach_vpc2'],
    enableVpc2: json['enable_vpc2'] == null ? undefined : json['enable_vpc2'],
    tags: json['tags'] == null ? undefined : json['tags'],
    userScheme: json['user_scheme'] == null ? undefined : json['user_scheme'],
    mdiskMode: json['mdisk_mode'] == null ? undefined : json['mdisk_mode'],
    appVariables: json['app_variables'] == null ? undefined : json['app_variables'],
  };
}

export function CreateBaremetalRequestToJSON(json: any): CreateBaremetalRequest {
  return CreateBaremetalRequestToJSONTyped(json, false);
}

export function CreateBaremetalRequestToJSONTyped(value?: CreateBaremetalRequest | null, ignoreDiscriminator: boolean = false): any {
  if (value == null) {
    return value;
  }

  return {
    region: value['region'],
    plan: value['plan'],
    script_id: value['scriptId'],
    enable_ipv6: value['enableIpv6'],
    sshkey_id: value['sshkeyId'],
    user_data: value['userData'],
    label: value['label'],
    activation_email: value['activationEmail'],
    hostname: value['hostname'],
    tag: value['tag'],
    reserved_ipv4: value['reservedIpv4'],
    os_id: value['osId'],
    snapshot_id: value['snapshotId'],
    app_id: value['appId'],
    image_id: value['imageId'],
    ipxe_chain_url: value['ipxeChainUrl'],
    persistent_pxe: value['persistentPxe'],
    attach_vpc2: value['attachVpc2'],
    detach_vpc2: value['detachVpc2'],
    enable_vpc2: value['enableVpc2'],
    tags: value['tags'],
    user_scheme: value['userScheme'],
    mdisk_mode: value['mdiskMode'],
    app_variables: value['appVariables'],
  };
}
