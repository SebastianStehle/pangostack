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
 * @interface CreateInstanceRequest
 */
export interface CreateInstanceRequest {
  /**
   * The [Region id](#operation/list-regions) where the Instance is located.
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  region: string;
  /**
   * The [Plan id](#operation/list-plans) to use when deploying this instance.
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  plan: string;
  /**
   * The [Operating System id](#operation/list-os) to use when deploying this instance.
   * @type {number}
   * @memberof CreateInstanceRequest
   */
  osId?: number;
  /**
   * The URL location of the iPXE chainloader.
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  ipxeChainUrl?: string;
  /**
   * The [ISO id](#operation/list-isos) to use when deploying this instance.
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  isoId?: string;
  /**
   * The [Startup Script id](#operation/list-startup-scripts) to use when deploying this instance.
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  scriptId?: string;
  /**
   * The [Snapshot id](#operation/list-snapshots) to use when deploying the instance.
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  snapshotId?: string;
  /**
   * Enable IPv6.
   *
   * * true
   * @type {boolean}
   * @memberof CreateInstanceRequest
   */
  enableIpv6?: boolean;
  /**
   * Don't set up a public IPv4 address when IPv6 is enabled. Will not do anything unless `enable_ipv6` is also `true`.
   *
   * * true
   * @type {boolean}
   * @memberof CreateInstanceRequest
   */
  disablePublicIpv4?: boolean;
  /**
   * Use `attach_vpc` instead. An array of [Private Network ids](#operation/list-networks) to attach to this Instance. This parameter takes precedence over `enable_private_network`. Please choose one parameter.
   * @type {Array<string>}
   * @memberof CreateInstanceRequest
   * @deprecated
   */
  attachPrivateNetwork?: Array<string>;
  /**
   * An array of [VPC IDs](#operation/list-vpcs) to attach to this Instance. This parameter takes precedence over `enable_vpc`. Please choose one parameter.
   * @type {Array<string>}
   * @memberof CreateInstanceRequest
   */
  attachVpc?: Array<string>;
  /**
   * Use `attach_vpc` instead. An array of [VPC IDs](#operation/list-vpc2) to attach to this Instance. This parameter takes precedence over `enable_vpc2`. Please choose one parameter.
   * @type {Array<string>}
   * @memberof CreateInstanceRequest
   * @deprecated
   */
  attachVpc2?: Array<string>;
  /**
   * A user-supplied label for this instance.
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  label?: string;
  /**
   * The [SSH Key id](#operation/list-ssh-keys) to install on this instance.
   * @type {Array<string>}
   * @memberof CreateInstanceRequest
   */
  sshkeyId?: Array<string>;
  /**
   * Enable automatic backups for the instance.
   *
   * * enabled
   * * disabled
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  backups?: string;
  /**
   * The [Application id](#operation/list-applications) to use when deploying this instance.
   * @type {number}
   * @memberof CreateInstanceRequest
   */
  appId?: number;
  /**
   * The [Application image_id](#operation/list-applications) to use when deploying this instance.
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  imageId?: string;
  /**
   * The user-supplied, base64 encoded [user data](https://docs.vultr.com/manage-instance-user-data-with-the-vultr-metadata-api/) to attach to this instance.
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  userData?: string;
  /**
   * Enable DDoS protection (there is an additional charge for this).
   *
   * * true
   * * false
   * @type {boolean}
   * @memberof CreateInstanceRequest
   */
  ddosProtection?: boolean;
  /**
   * Notify by email after deployment.
   *
   * * true
   * * false (default)
   * @type {boolean}
   * @memberof CreateInstanceRequest
   */
  activationEmail?: boolean;
  /**
   * The hostname to use when deploying this instance.
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  hostname?: string;
  /**
   * Use `tags` instead. The user-supplied tag.
   * @type {string}
   * @memberof CreateInstanceRequest
   * @deprecated
   */
  tag?: string;
  /**
   * The [Firewall Group id](#operation/list-firewall-groups) to attach to this Instance.
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  firewallGroupId?: string;
  /**
   * ID of the floating IP to use as the main IP of this server.
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  reservedIpv4?: string;
  /**
   * Use `enable_vpc` instead.
   *
   * If `true`, private networking support will be added to the new server.
   *
   * This parameter attaches a single network. When no network exists in the region, it will be automatically created.
   *
   * If there are multiple private networks in the instance's region, use `attach_private_network` instead to specify a network.
   * @type {boolean}
   * @memberof CreateInstanceRequest
   * @deprecated
   */
  enablePrivateNetwork?: boolean;
  /**
   * If `true`, VPC support will be added to the new server.
   *
   * This parameter attaches a single VPC. When no VPC exists in the region, it will be automatically created.
   *
   * If there are multiple VPCs in the instance's region, use `attach_vpc` instead to specify a network.
   * @type {boolean}
   * @memberof CreateInstanceRequest
   */
  enableVpc?: boolean;
  /**
   * Use `enable_vpc` instead.
   *
   * If `true`, VPC 2.0 support will be added to the new server.
   *
   * This parameter attaches a single VPC 2.0 network. When no VPC 2.0 network exists in the region, it will be automatically created.
   *
   * If there are multiple VPC 2.0 networks in the instance's region, use `attach_vpc2` instead to specify a network.
   * @type {boolean}
   * @memberof CreateInstanceRequest
   * @deprecated
   */
  enableVpc2?: boolean;
  /**
   * Tags to apply to the instance
   * @type {Array<string>}
   * @memberof CreateInstanceRequest
   */
  tags?: Array<string>;
  /**
   * Linux-only: The user scheme used for logging into this instance. By default, the "root" user is configured. Alternatively, a limited user with sudo permissions can be selected.
   *
   * * root
   * * limited
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  userScheme?: string;
  /**
   * The [app variable inputs](#operation/list-marketplace-app-variables) for configuring the marketplace app (name/value pairs).
   * @type {object}
   * @memberof CreateInstanceRequest
   */
  appVariables?: object;
}

/**
 * Check if a given object implements the CreateInstanceRequest interface.
 */
export function instanceOfCreateInstanceRequest(value: object): value is CreateInstanceRequest {
  if (!('region' in value) || value['region'] === undefined) return false;
  if (!('plan' in value) || value['plan'] === undefined) return false;
  return true;
}

export function CreateInstanceRequestFromJSON(json: any): CreateInstanceRequest {
  return CreateInstanceRequestFromJSONTyped(json, false);
}

export function CreateInstanceRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateInstanceRequest {
  if (json == null) {
    return json;
  }
  return {
    region: json['region'],
    plan: json['plan'],
    osId: json['os_id'] == null ? undefined : json['os_id'],
    ipxeChainUrl: json['ipxe_chain_url'] == null ? undefined : json['ipxe_chain_url'],
    isoId: json['iso_id'] == null ? undefined : json['iso_id'],
    scriptId: json['script_id'] == null ? undefined : json['script_id'],
    snapshotId: json['snapshot_id'] == null ? undefined : json['snapshot_id'],
    enableIpv6: json['enable_ipv6'] == null ? undefined : json['enable_ipv6'],
    disablePublicIpv4: json['disable_public_ipv4'] == null ? undefined : json['disable_public_ipv4'],
    attachPrivateNetwork: json['attach_private_network'] == null ? undefined : json['attach_private_network'],
    attachVpc: json['attach_vpc'] == null ? undefined : json['attach_vpc'],
    attachVpc2: json['attach_vpc2'] == null ? undefined : json['attach_vpc2'],
    label: json['label'] == null ? undefined : json['label'],
    sshkeyId: json['sshkey_id'] == null ? undefined : json['sshkey_id'],
    backups: json['backups'] == null ? undefined : json['backups'],
    appId: json['app_id'] == null ? undefined : json['app_id'],
    imageId: json['image_id'] == null ? undefined : json['image_id'],
    userData: json['user_data'] == null ? undefined : json['user_data'],
    ddosProtection: json['ddos_protection'] == null ? undefined : json['ddos_protection'],
    activationEmail: json['activation_email'] == null ? undefined : json['activation_email'],
    hostname: json['hostname'] == null ? undefined : json['hostname'],
    tag: json['tag'] == null ? undefined : json['tag'],
    firewallGroupId: json['firewall_group_id'] == null ? undefined : json['firewall_group_id'],
    reservedIpv4: json['reserved_ipv4'] == null ? undefined : json['reserved_ipv4'],
    enablePrivateNetwork: json['enable_private_network'] == null ? undefined : json['enable_private_network'],
    enableVpc: json['enable_vpc'] == null ? undefined : json['enable_vpc'],
    enableVpc2: json['enable_vpc2'] == null ? undefined : json['enable_vpc2'],
    tags: json['tags'] == null ? undefined : json['tags'],
    userScheme: json['user_scheme'] == null ? undefined : json['user_scheme'],
    appVariables: json['app_variables'] == null ? undefined : json['app_variables'],
  };
}

export function CreateInstanceRequestToJSON(json: any): CreateInstanceRequest {
  return CreateInstanceRequestToJSONTyped(json, false);
}

export function CreateInstanceRequestToJSONTyped(value?: CreateInstanceRequest | null, ignoreDiscriminator: boolean = false): any {
  if (value == null) {
    return value;
  }

  return {
    region: value['region'],
    plan: value['plan'],
    os_id: value['osId'],
    ipxe_chain_url: value['ipxeChainUrl'],
    iso_id: value['isoId'],
    script_id: value['scriptId'],
    snapshot_id: value['snapshotId'],
    enable_ipv6: value['enableIpv6'],
    disable_public_ipv4: value['disablePublicIpv4'],
    attach_private_network: value['attachPrivateNetwork'],
    attach_vpc: value['attachVpc'],
    attach_vpc2: value['attachVpc2'],
    label: value['label'],
    sshkey_id: value['sshkeyId'],
    backups: value['backups'],
    app_id: value['appId'],
    image_id: value['imageId'],
    user_data: value['userData'],
    ddos_protection: value['ddosProtection'],
    activation_email: value['activationEmail'],
    hostname: value['hostname'],
    tag: value['tag'],
    firewall_group_id: value['firewallGroupId'],
    reserved_ipv4: value['reservedIpv4'],
    enable_private_network: value['enablePrivateNetwork'],
    enable_vpc: value['enableVpc'],
    enable_vpc2: value['enableVpc2'],
    tags: value['tags'],
    user_scheme: value['userScheme'],
    app_variables: value['appVariables'],
  };
}
