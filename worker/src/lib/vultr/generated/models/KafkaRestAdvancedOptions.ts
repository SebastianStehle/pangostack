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
 * Managed Database Kafka REST Advanced Options
 * @export
 * @interface KafkaRestAdvancedOptions
 */
export interface KafkaRestAdvancedOptions {
  /**
   * The number of acknowledgments the producer requires the leader to have received before considering a request complete. If set to `all` or `-1`, the leader will wait for the full set of in-sync replicas to acknowledge the record.
   * @type {string}
   * @memberof KafkaRestAdvancedOptions
   */
  producerAcks?: string;
  /**
   *
   * @type {string}
   * @memberof KafkaRestAdvancedOptions
   */
  producerCompressionType?: KafkaRestAdvancedOptionsProducerCompressionTypeEnum;
  /**
   * Accepted values: 1 - 5000
   * @type {number}
   * @memberof KafkaRestAdvancedOptions
   */
  producerLingerMs?: number;
  /**
   * Accepted values: 1 - 2147483647
   * @type {number}
   * @memberof KafkaRestAdvancedOptions
   */
  producerMaxRequestSize?: number;
  /**
   *
   * @type {boolean}
   * @memberof KafkaRestAdvancedOptions
   */
  consumerEnableAutoCommit?: boolean;
  /**
   * Accepted values: 1 - 671088640
   * @type {number}
   * @memberof KafkaRestAdvancedOptions
   */
  consumerRequestMaxBytes?: number;
  /**
   * Accepted values: 1000 - 30000
   * @type {number}
   * @memberof KafkaRestAdvancedOptions
   */
  consumerRequestTimeoutMs?: number;
  /**
   * Name strategy to use when selecting subject for storing schemas.
   * @type {string}
   * @memberof KafkaRestAdvancedOptions
   */
  nameStrategy?: string;
  /**
   *
   * @type {boolean}
   * @memberof KafkaRestAdvancedOptions
   */
  nameStrategyValidation?: boolean;
  /**
   * Accepted values: 10 - 250
   * @type {number}
   * @memberof KafkaRestAdvancedOptions
   */
  simpleconsumerPoolSizeMax?: number;
}

/**
 * @export
 */
export const KafkaRestAdvancedOptionsProducerCompressionTypeEnum = {
  Gzip: 'gzip',
  Snappy: 'snappy',
  Lz4: 'lz4',
  Zstd: 'zstd',
  None: 'none',
} as const;
export type KafkaRestAdvancedOptionsProducerCompressionTypeEnum =
  (typeof KafkaRestAdvancedOptionsProducerCompressionTypeEnum)[keyof typeof KafkaRestAdvancedOptionsProducerCompressionTypeEnum];

/**
 * Check if a given object implements the KafkaRestAdvancedOptions interface.
 */
export function instanceOfKafkaRestAdvancedOptions(value: object): value is KafkaRestAdvancedOptions {
  return true;
}

export function KafkaRestAdvancedOptionsFromJSON(json: any): KafkaRestAdvancedOptions {
  return KafkaRestAdvancedOptionsFromJSONTyped(json, false);
}

export function KafkaRestAdvancedOptionsFromJSONTyped(json: any, ignoreDiscriminator: boolean): KafkaRestAdvancedOptions {
  if (json == null) {
    return json;
  }
  return {
    producerAcks: json['producer_acks'] == null ? undefined : json['producer_acks'],
    producerCompressionType: json['producer_compression_type'] == null ? undefined : json['producer_compression_type'],
    producerLingerMs: json['producer_linger_ms'] == null ? undefined : json['producer_linger_ms'],
    producerMaxRequestSize: json['producer_max_request_size'] == null ? undefined : json['producer_max_request_size'],
    consumerEnableAutoCommit: json['consumer_enable_auto_commit'] == null ? undefined : json['consumer_enable_auto_commit'],
    consumerRequestMaxBytes: json['consumer_request_max_bytes'] == null ? undefined : json['consumer_request_max_bytes'],
    consumerRequestTimeoutMs: json['consumer_request_timeout_ms'] == null ? undefined : json['consumer_request_timeout_ms'],
    nameStrategy: json['name_strategy'] == null ? undefined : json['name_strategy'],
    nameStrategyValidation: json['name_strategy_validation'] == null ? undefined : json['name_strategy_validation'],
    simpleconsumerPoolSizeMax: json['simpleconsumer_pool_size_max'] == null ? undefined : json['simpleconsumer_pool_size_max'],
  };
}

export function KafkaRestAdvancedOptionsToJSON(json: any): KafkaRestAdvancedOptions {
  return KafkaRestAdvancedOptionsToJSONTyped(json, false);
}

export function KafkaRestAdvancedOptionsToJSONTyped(value?: KafkaRestAdvancedOptions | null, ignoreDiscriminator: boolean = false): any {
  if (value == null) {
    return value;
  }

  return {
    producer_acks: value['producerAcks'],
    producer_compression_type: value['producerCompressionType'],
    producer_linger_ms: value['producerLingerMs'],
    producer_max_request_size: value['producerMaxRequestSize'],
    consumer_enable_auto_commit: value['consumerEnableAutoCommit'],
    consumer_request_max_bytes: value['consumerRequestMaxBytes'],
    consumer_request_timeout_ms: value['consumerRequestTimeoutMs'],
    name_strategy: value['nameStrategy'],
    name_strategy_validation: value['nameStrategyValidation'],
    simpleconsumer_pool_size_max: value['simpleconsumerPoolSizeMax'],
  };
}
