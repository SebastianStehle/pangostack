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
import type { CreateLoadBalancerRequestForwardingRulesInner } from './CreateLoadBalancerRequestForwardingRulesInner';
import {
  CreateLoadBalancerRequestForwardingRulesInnerFromJSON,
  CreateLoadBalancerRequestForwardingRulesInnerFromJSONTyped,
  CreateLoadBalancerRequestForwardingRulesInnerToJSON,
  CreateLoadBalancerRequestForwardingRulesInnerToJSONTyped,
} from './CreateLoadBalancerRequestForwardingRulesInner';
import type { CreateLoadBalancerRequestStickySession } from './CreateLoadBalancerRequestStickySession';
import {
  CreateLoadBalancerRequestStickySessionFromJSON,
  CreateLoadBalancerRequestStickySessionFromJSONTyped,
  CreateLoadBalancerRequestStickySessionToJSON,
  CreateLoadBalancerRequestStickySessionToJSONTyped,
} from './CreateLoadBalancerRequestStickySession';
import type { CreateLoadBalancerRequestAutoSsl } from './CreateLoadBalancerRequestAutoSsl';
import {
  CreateLoadBalancerRequestAutoSslFromJSON,
  CreateLoadBalancerRequestAutoSslFromJSONTyped,
  CreateLoadBalancerRequestAutoSslToJSON,
  CreateLoadBalancerRequestAutoSslToJSONTyped,
} from './CreateLoadBalancerRequestAutoSsl';
import type { CreateLoadBalancerRequestFirewallRulesInner } from './CreateLoadBalancerRequestFirewallRulesInner';
import {
  CreateLoadBalancerRequestFirewallRulesInnerFromJSON,
  CreateLoadBalancerRequestFirewallRulesInnerFromJSONTyped,
  CreateLoadBalancerRequestFirewallRulesInnerToJSON,
  CreateLoadBalancerRequestFirewallRulesInnerToJSONTyped,
} from './CreateLoadBalancerRequestFirewallRulesInner';
import type { UpdateLoadBalancerRequestHealthCheck } from './UpdateLoadBalancerRequestHealthCheck';
import {
  UpdateLoadBalancerRequestHealthCheckFromJSON,
  UpdateLoadBalancerRequestHealthCheckFromJSONTyped,
  UpdateLoadBalancerRequestHealthCheckToJSON,
  UpdateLoadBalancerRequestHealthCheckToJSONTyped,
} from './UpdateLoadBalancerRequestHealthCheck';
import type { CreateLoadBalancerRequestSsl } from './CreateLoadBalancerRequestSsl';
import {
  CreateLoadBalancerRequestSslFromJSON,
  CreateLoadBalancerRequestSslFromJSONTyped,
  CreateLoadBalancerRequestSslToJSON,
  CreateLoadBalancerRequestSslToJSONTyped,
} from './CreateLoadBalancerRequestSsl';

/**
 *
 * @export
 * @interface UpdateLoadBalancerRequest
 */
export interface UpdateLoadBalancerRequest {
  /**
   *
   * @type {CreateLoadBalancerRequestSsl}
   * @memberof UpdateLoadBalancerRequest
   */
  ssl?: CreateLoadBalancerRequestSsl;
  /**
   *
   * @type {CreateLoadBalancerRequestStickySession}
   * @memberof UpdateLoadBalancerRequest
   */
  stickySession?: CreateLoadBalancerRequestStickySession;
  /**
   * An array of forwarding rule objects.
   * @type {Array<CreateLoadBalancerRequestForwardingRulesInner>}
   * @memberof UpdateLoadBalancerRequest
   */
  forwardingRules?: Array<CreateLoadBalancerRequestForwardingRulesInner>;
  /**
   *
   * @type {UpdateLoadBalancerRequestHealthCheck}
   * @memberof UpdateLoadBalancerRequest
   */
  healthCheck?: UpdateLoadBalancerRequestHealthCheck;
  /**
   * If `true`, you must configure backend nodes to accept Proxy protocol.
   *
   * * true
   * * false (Default)
   * @type {boolean}
   * @memberof UpdateLoadBalancerRequest
   */
  proxyProtocol?: boolean;
  /**
   * The maximum time allowed for the connection to remain inactive before timing out in seconds. This defaults to 600.
   * @type {number}
   * @memberof UpdateLoadBalancerRequest
   */
  timeout?: number;
  /**
   * If `true`, this will redirect all HTTP traffic to HTTPS. You must have an HTTPS rule and SSL certificate installed on the load balancer to enable this option.
   *
   * * true
   * * false
   * @type {boolean}
   * @memberof UpdateLoadBalancerRequest
   */
  sslRedirect?: boolean;
  /**
   * If `true`, this will enable HTTP2 traffic. You must have an HTTPS forwarding rule combo (HTTPS -> HTTPS) to enable this option.
   *
   * * true
   * * false
   * @type {boolean}
   * @memberof UpdateLoadBalancerRequest
   */
  http2?: boolean;
  /**
   * If `true`, this will enable HTTP3/QUIC traffic. You must have HTTP2 enabled.
   *
   * * true
   * * false
   * @type {boolean}
   * @memberof UpdateLoadBalancerRequest
   */
  http3?: boolean;
  /**
   * The number of nodes to add to the load balancer (1-99), must be an odd number. This defaults to 1.
   * @type {number}
   * @memberof UpdateLoadBalancerRequest
   */
  nodes?: number;
  /**
   * The balancing algorithm.
   *
   * * roundrobin (default)
   * * leastconn
   * @type {string}
   * @memberof UpdateLoadBalancerRequest
   */
  balancingAlgorithm?: string;
  /**
   * Send the complete array of Instances IDs that should be attached to this Load Balancer. Instances will be attached or detached to match your array. For example, if Instances **X**, **Y**, and **Z** are currently attached, and you send [A,B,Z], then Instance **A** and **B** will be attached,  **X** and **Y** will be detached, and **Z** will remain attached.
   * @type {Array<string>}
   * @memberof UpdateLoadBalancerRequest
   */
  instances?: Array<string>;
  /**
   * The label for your Load Balancer
   * @type {string}
   * @memberof UpdateLoadBalancerRequest
   */
  label?: string;
  /**
   * Use `vpc` instead. ID of the private network you wish to use. If private_network is omitted it will default to the public network.
   * @type {string}
   * @memberof UpdateLoadBalancerRequest
   * @deprecated
   */
  privateNetwork?: string;
  /**
   * ID of the VPC you wish to use. If a VPC ID is omitted it will default to the public network.
   * @type {string}
   * @memberof UpdateLoadBalancerRequest
   */
  vpc?: string;
  /**
   * An array of firewall rule objects.
   * @type {Array<CreateLoadBalancerRequestFirewallRulesInner>}
   * @memberof UpdateLoadBalancerRequest
   */
  firewallRules?: Array<CreateLoadBalancerRequestFirewallRulesInner>;
  /**
   *
   * @type {CreateLoadBalancerRequestAutoSsl}
   * @memberof UpdateLoadBalancerRequest
   */
  autoSsl?: CreateLoadBalancerRequestAutoSsl;
  /**
   * Array of [Region ids](#operation/list-regions) to deploy child Load Balancers to.
   * @type {Array<string>}
   * @memberof UpdateLoadBalancerRequest
   */
  globalRegions?: Array<string>;
}

/**
 * Check if a given object implements the UpdateLoadBalancerRequest interface.
 */
export function instanceOfUpdateLoadBalancerRequest(value: object): value is UpdateLoadBalancerRequest {
  return true;
}

export function UpdateLoadBalancerRequestFromJSON(json: any): UpdateLoadBalancerRequest {
  return UpdateLoadBalancerRequestFromJSONTyped(json, false);
}

export function UpdateLoadBalancerRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): UpdateLoadBalancerRequest {
  if (json == null) {
    return json;
  }
  return {
    ssl: json['ssl'] == null ? undefined : CreateLoadBalancerRequestSslFromJSON(json['ssl']),
    stickySession: json['sticky_session'] == null ? undefined : CreateLoadBalancerRequestStickySessionFromJSON(json['sticky_session']),
    forwardingRules:
      json['forwarding_rules'] == null
        ? undefined
        : (json['forwarding_rules'] as Array<any>).map(CreateLoadBalancerRequestForwardingRulesInnerFromJSON),
    healthCheck: json['health_check'] == null ? undefined : UpdateLoadBalancerRequestHealthCheckFromJSON(json['health_check']),
    proxyProtocol: json['proxy_protocol'] == null ? undefined : json['proxy_protocol'],
    timeout: json['timeout'] == null ? undefined : json['timeout'],
    sslRedirect: json['ssl_redirect'] == null ? undefined : json['ssl_redirect'],
    http2: json['http2'] == null ? undefined : json['http2'],
    http3: json['http3'] == null ? undefined : json['http3'],
    nodes: json['nodes'] == null ? undefined : json['nodes'],
    balancingAlgorithm: json['balancing_algorithm'] == null ? undefined : json['balancing_algorithm'],
    instances: json['instances'] == null ? undefined : json['instances'],
    label: json['label'] == null ? undefined : json['label'],
    privateNetwork: json['private_network'] == null ? undefined : json['private_network'],
    vpc: json['vpc'] == null ? undefined : json['vpc'],
    firewallRules:
      json['firewall_rules'] == null
        ? undefined
        : (json['firewall_rules'] as Array<any>).map(CreateLoadBalancerRequestFirewallRulesInnerFromJSON),
    autoSsl: json['auto_ssl'] == null ? undefined : CreateLoadBalancerRequestAutoSslFromJSON(json['auto_ssl']),
    globalRegions: json['global_regions'] == null ? undefined : json['global_regions'],
  };
}

export function UpdateLoadBalancerRequestToJSON(json: any): UpdateLoadBalancerRequest {
  return UpdateLoadBalancerRequestToJSONTyped(json, false);
}

export function UpdateLoadBalancerRequestToJSONTyped(value?: UpdateLoadBalancerRequest | null, ignoreDiscriminator: boolean = false): any {
  if (value == null) {
    return value;
  }

  return {
    ssl: CreateLoadBalancerRequestSslToJSON(value['ssl']),
    sticky_session: CreateLoadBalancerRequestStickySessionToJSON(value['stickySession']),
    forwarding_rules:
      value['forwardingRules'] == null
        ? undefined
        : (value['forwardingRules'] as Array<any>).map(CreateLoadBalancerRequestForwardingRulesInnerToJSON),
    health_check: UpdateLoadBalancerRequestHealthCheckToJSON(value['healthCheck']),
    proxy_protocol: value['proxyProtocol'],
    timeout: value['timeout'],
    ssl_redirect: value['sslRedirect'],
    http2: value['http2'],
    http3: value['http3'],
    nodes: value['nodes'],
    balancing_algorithm: value['balancingAlgorithm'],
    instances: value['instances'],
    label: value['label'],
    private_network: value['privateNetwork'],
    vpc: value['vpc'],
    firewall_rules:
      value['firewallRules'] == null
        ? undefined
        : (value['firewallRules'] as Array<any>).map(CreateLoadBalancerRequestFirewallRulesInnerToJSON),
    auto_ssl: CreateLoadBalancerRequestAutoSslToJSON(value['autoSsl']),
    global_regions: value['globalRegions'],
  };
}
