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
 * Bare Metal information.
 * @export
 * @interface Baremetal
 */
export interface Baremetal {
  /**
   * A unique ID for the Bare Metal instance.
   * @type {string}
   * @memberof Baremetal
   */
  id?: string;
  /**
   * The [Operating System name](#operation/list-os).
   * @type {string}
   * @memberof Baremetal
   */
  os?: string;
  /**
   * Text description of the instances' RAM.
   * @type {string}
   * @memberof Baremetal
   */
  ram?: string;
  /**
   * Text description of the instances' disk configuration.
   * @type {string}
   * @memberof Baremetal
   */
  disk?: string;
  /**
   * The main IPv4 address.
   * @type {string}
   * @memberof Baremetal
   */
  mainIp?: string;
  /**
   * Number of CPUs.
   * @type {number}
   * @memberof Baremetal
   */
  cpuCount?: number;
  /**
   * The [Region id](#operation/list-regions) where the instance is located.
   * @type {string}
   * @memberof Baremetal
   */
  region?: string;
  /**
   * The default password assigned at deployment. Only available for ten minutes after deployment.
   * @type {string}
   * @memberof Baremetal
   */
  defaultPassword?: string;
  /**
   * The date this instance was created.
   * @type {string}
   * @memberof Baremetal
   */
  dateCreated?: string;
  /**
   * The current status.
   *
   * * active
   * * pending
   * * suspended
   * @type {string}
   * @memberof Baremetal
   */
  status?: string;
  /**
   * The IPv4 netmask in dot-decimal notation.
   * @type {string}
   * @memberof Baremetal
   */
  netmaskV4?: string;
  /**
   * The IPv4 gateway address.
   * @type {string}
   * @memberof Baremetal
   */
  gatewayV4?: string;
  /**
   * The [Bare Metal Plan id](#operation/list-metal-plans) used by this instance.
   * @type {string}
   * @memberof Baremetal
   */
  plan?: string;
  /**
   * The user-supplied label for this instance.
   * @type {string}
   * @memberof Baremetal
   */
  label?: string;
  /**
   * Use `tags` instead. The user-supplied tag for this instance.
   * @type {string}
   * @memberof Baremetal
   * @deprecated
   */
  tag?: string;
  /**
   * The [Operating System id](#operation/list-os).
   * @type {number}
   * @memberof Baremetal
   */
  osId?: number;
  /**
   * The [Application id](#operation/list-applications).
   * @type {number}
   * @memberof Baremetal
   */
  appId?: number;
  /**
   * The [Application image_id](#operation/list-applications).
   * @type {string}
   * @memberof Baremetal
   */
  imageId?: string;
  /**
   * The [Snapshot id](#operation/list-snapshots).
   * @type {string}
   * @memberof Baremetal
   */
  snapshotId?: string;
  /**
   * The IPv6 network size in bits.
   * @type {string}
   * @memberof Baremetal
   */
  v6Network?: string;
  /**
   * The main IPv6 network address.
   * @type {string}
   * @memberof Baremetal
   */
  v6MainIp?: string;
  /**
   * The IPv6 subnet.
   * @type {number}
   * @memberof Baremetal
   */
  v6NetworkSize?: number;
  /**
   * The MAC address for a Bare Metal server.
   * @type {number}
   * @memberof Baremetal
   */
  macAddress?: number;
  /**
   * Tags to apply to the instance.
   * @type {Array<string>}
   * @memberof Baremetal
   */
  tags?: Array<string>;
  /**
   * The user scheme.
   *
   * * root
   * * limited
   * @type {string}
   * @memberof Baremetal
   */
  userScheme?: string;
}

/**
 * Check if a given object implements the Baremetal interface.
 */
export function instanceOfBaremetal(value: object): value is Baremetal {
  return true;
}

export function BaremetalFromJSON(json: any): Baremetal {
  return BaremetalFromJSONTyped(json, false);
}

export function BaremetalFromJSONTyped(json: any, ignoreDiscriminator: boolean): Baremetal {
  if (json == null) {
    return json;
  }
  return {
    id: json['id'] == null ? undefined : json['id'],
    os: json['os'] == null ? undefined : json['os'],
    ram: json['ram'] == null ? undefined : json['ram'],
    disk: json['disk'] == null ? undefined : json['disk'],
    mainIp: json['main_ip'] == null ? undefined : json['main_ip'],
    cpuCount: json['cpu_count'] == null ? undefined : json['cpu_count'],
    region: json['region'] == null ? undefined : json['region'],
    defaultPassword: json['default_password'] == null ? undefined : json['default_password'],
    dateCreated: json['date_created'] == null ? undefined : json['date_created'],
    status: json['status'] == null ? undefined : json['status'],
    netmaskV4: json['netmask_v4'] == null ? undefined : json['netmask_v4'],
    gatewayV4: json['gateway_v4'] == null ? undefined : json['gateway_v4'],
    plan: json['plan'] == null ? undefined : json['plan'],
    label: json['label'] == null ? undefined : json['label'],
    tag: json['tag'] == null ? undefined : json['tag'],
    osId: json['os_id'] == null ? undefined : json['os_id'],
    appId: json['app_id'] == null ? undefined : json['app_id'],
    imageId: json['image_id'] == null ? undefined : json['image_id'],
    snapshotId: json['snapshot_id'] == null ? undefined : json['snapshot_id'],
    v6Network: json['v6_network'] == null ? undefined : json['v6_network'],
    v6MainIp: json['v6_main_ip'] == null ? undefined : json['v6_main_ip'],
    v6NetworkSize: json['v6_network_size'] == null ? undefined : json['v6_network_size'],
    macAddress: json['mac_address'] == null ? undefined : json['mac_address'],
    tags: json['tags'] == null ? undefined : json['tags'],
    userScheme: json['user_scheme'] == null ? undefined : json['user_scheme'],
  };
}

export function BaremetalToJSON(json: any): Baremetal {
  return BaremetalToJSONTyped(json, false);
}

export function BaremetalToJSONTyped(value?: Baremetal | null, ignoreDiscriminator: boolean = false): any {
  if (value == null) {
    return value;
  }

  return {
    id: value['id'],
    os: value['os'],
    ram: value['ram'],
    disk: value['disk'],
    main_ip: value['mainIp'],
    cpu_count: value['cpuCount'],
    region: value['region'],
    default_password: value['defaultPassword'],
    date_created: value['dateCreated'],
    status: value['status'],
    netmask_v4: value['netmaskV4'],
    gateway_v4: value['gatewayV4'],
    plan: value['plan'],
    label: value['label'],
    tag: value['tag'],
    os_id: value['osId'],
    app_id: value['appId'],
    image_id: value['imageId'],
    snapshot_id: value['snapshotId'],
    v6_network: value['v6Network'],
    v6_main_ip: value['v6MainIp'],
    v6_network_size: value['v6NetworkSize'],
    mac_address: value['macAddress'],
    tags: value['tags'],
    user_scheme: value['userScheme'],
  };
}
