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
import type { NodepoolInstances } from './NodepoolInstances';
import {
  NodepoolInstancesFromJSON,
  NodepoolInstancesFromJSONTyped,
  NodepoolInstancesToJSON,
  NodepoolInstancesToJSONTyped,
} from './NodepoolInstances';

/**
 * NodePool
 * @export
 * @interface Nodepools
 */
export interface Nodepools {
  /**
   * The [NodePool ID](#operation/get-nodepools).
   * @type {string}
   * @memberof Nodepools
   */
  id?: string;
  /**
   * Date of creation
   * @type {string}
   * @memberof Nodepools
   */
  dateCreated?: string;
  /**
   * Label for nodepool
   * @type {string}
   * @memberof Nodepools
   */
  label?: string;
  /**
   * Tag for node pool
   * @type {string}
   * @memberof Nodepools
   */
  tag?: string;
  /**
   * Plan used for nodepool
   * @type {string}
   * @memberof Nodepools
   */
  plan?: string;
  /**
   * Status for nodepool
   * @type {string}
   * @memberof Nodepools
   */
  status?: string;
  /**
   * Number of nodes in nodepool
   * @type {number}
   * @memberof Nodepools
   */
  nodeQuantity?: number;
  /**
   *
   * @type {Array<NodepoolInstances>}
   * @memberof Nodepools
   */
  nodes?: Array<NodepoolInstances>;
  /**
   * Date the nodepool was updated.
   * @type {string}
   * @memberof Nodepools
   */
  dateUpdated?: string;
  /**
   * Displays if the auto scaler is enabled or disabled for your cluster.
   * @type {boolean}
   * @memberof Nodepools
   */
  autoScaler?: boolean;
  /**
   * Auto scaler field that displays the minimum nodes you want for your cluster.
   * @type {number}
   * @memberof Nodepools
   */
  minNodes?: number;
  /**
   * Auto scaler field that displays the maximum nodes you want for your cluster.
   * @type {any}
   * @memberof Nodepools
   */
  maxNodes?: any | null;
  /**
   * Map of key/value pairs defining labels to automatically apply to all nodes in this nodepool.
   * @type {object}
   * @memberof Nodepools
   */
  labels?: object;
  /**
   * Array of objects containing key, value, and effect.
   * @type {Array<string>}
   * @memberof Nodepools
   */
  taints?: Array<string>;
  /**
   * The user-supplied, base64 encoded user data for all nodes in nodepool (only applied on nodes created after user data is set).
   * @type {string}
   * @memberof Nodepools
   */
  userData?: string;
}

/**
 * Check if a given object implements the Nodepools interface.
 */
export function instanceOfNodepools(value: object): value is Nodepools {
  return true;
}

export function NodepoolsFromJSON(json: any): Nodepools {
  return NodepoolsFromJSONTyped(json, false);
}

export function NodepoolsFromJSONTyped(json: any, ignoreDiscriminator: boolean): Nodepools {
  if (json == null) {
    return json;
  }
  return {
    id: json['id'] == null ? undefined : json['id'],
    dateCreated: json['date_created'] == null ? undefined : json['date_created'],
    label: json['label'] == null ? undefined : json['label'],
    tag: json['tag'] == null ? undefined : json['tag'],
    plan: json['plan'] == null ? undefined : json['plan'],
    status: json['status'] == null ? undefined : json['status'],
    nodeQuantity: json['node_quantity'] == null ? undefined : json['node_quantity'],
    nodes: json['nodes'] == null ? undefined : (json['nodes'] as Array<any>).map(NodepoolInstancesFromJSON),
    dateUpdated: json['date_updated'] == null ? undefined : json['date_updated'],
    autoScaler: json['auto_scaler'] == null ? undefined : json['auto_scaler'],
    minNodes: json['min_nodes'] == null ? undefined : json['min_nodes'],
    maxNodes: json['max_nodes'] == null ? undefined : json['max_nodes'],
    labels: json['labels'] == null ? undefined : json['labels'],
    taints: json['taints'] == null ? undefined : json['taints'],
    userData: json['user_data'] == null ? undefined : json['user_data'],
  };
}

export function NodepoolsToJSON(json: any): Nodepools {
  return NodepoolsToJSONTyped(json, false);
}

export function NodepoolsToJSONTyped(value?: Nodepools | null, ignoreDiscriminator: boolean = false): any {
  if (value == null) {
    return value;
  }

  return {
    id: value['id'],
    date_created: value['dateCreated'],
    label: value['label'],
    tag: value['tag'],
    plan: value['plan'],
    status: value['status'],
    node_quantity: value['nodeQuantity'],
    nodes: value['nodes'] == null ? undefined : (value['nodes'] as Array<any>).map(NodepoolInstancesToJSON),
    date_updated: value['dateUpdated'],
    auto_scaler: value['autoScaler'],
    min_nodes: value['minNodes'],
    max_nodes: value['maxNodes'],
    labels: value['labels'],
    taints: value['taints'],
    user_data: value['userData'],
  };
}
