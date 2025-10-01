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
 * Managed Database Kafka Connect Advanced Options
 * @export
 * @interface KafkaConnectAdvancedOptions
 */
export interface KafkaConnectAdvancedOptions {
  /**
   * Defines what client configurations can be overridden by the connector. Default is None.
   * @type {string}
   * @memberof KafkaConnectAdvancedOptions
   */
  connectorClientConfigOverridePolicy?: string;
  /**
   * What to do when there is no initial offset in Kafka or if the current offset does not exist any more on the server. Default is earliest.
   * @type {string}
   * @memberof KafkaConnectAdvancedOptions
   */
  consumerAutoOffsetReset?: string;
  /**
   * Accepted values: 1048576 - 104857600
   * @type {number}
   * @memberof KafkaConnectAdvancedOptions
   */
  consumerFetchMaxBytes?: number;
  /**
   * Transaction read isolation level. `read_uncommitted` is the default, but `read_committed` can be used if consume-exactly-once behavior is desired.
   * @type {string}
   * @memberof KafkaConnectAdvancedOptions
   */
  consumerIsolationLevel?: string;
  /**
   * Accepted values: 1048576 - 104857600
   * @type {number}
   * @memberof KafkaConnectAdvancedOptions
   */
  consumerMaxPartitionFetchBytes?: number;
  /**
   * Accepted values: 1 - 2147483647
   * @type {number}
   * @memberof KafkaConnectAdvancedOptions
   */
  consumerMaxPollIntervalMs?: number;
  /**
   * Accepted values: 1 - 10000
   * @type {number}
   * @memberof KafkaConnectAdvancedOptions
   */
  consumerMaxPollRecords?: number;
  /**
   * Accepted values: 1 - 100000000
   * @type {number}
   * @memberof KafkaConnectAdvancedOptions
   */
  offsetFlushIntervalMs?: number;
  /**
   * Accepted values: 1 - 2147483647
   * @type {number}
   * @memberof KafkaConnectAdvancedOptions
   */
  offsetFlushTimeoutMs?: number;
  /**
   * Accepted values: 1 - 5242880
   * @type {number}
   * @memberof KafkaConnectAdvancedOptions
   */
  producerBatchSize?: number;
  /**
   * Accepted values: 5242880 - 134217728
   * @type {number}
   * @memberof KafkaConnectAdvancedOptions
   */
  producerBufferMemory?: number;
  /**
   *
   * @type {string}
   * @memberof KafkaConnectAdvancedOptions
   */
  producerCompressionType?: KafkaConnectAdvancedOptionsProducerCompressionTypeEnum;
  /**
   * Accepted values: 1 - 5000
   * @type {number}
   * @memberof KafkaConnectAdvancedOptions
   */
  producerLingerMs?: number;
  /**
   * Accepted values: 131072 - 67108864
   * @type {number}
   * @memberof KafkaConnectAdvancedOptions
   */
  producerMaxRequestSize?: number;
  /**
   * Accepted values: 1 - 600000
   * @type {number}
   * @memberof KafkaConnectAdvancedOptions
   */
  scheduledRebalanceMaxDelayMs?: number;
  /**
   * Accepted values: 1 - 2147483647
   * @type {number}
   * @memberof KafkaConnectAdvancedOptions
   */
  sessionTimeoutMs?: number;
}

/**
 * @export
 */
export const KafkaConnectAdvancedOptionsProducerCompressionTypeEnum = {
  Gzip: 'gzip',
  Snappy: 'snappy',
  Lz4: 'lz4',
  Zstd: 'zstd',
  None: 'none',
} as const;
export type KafkaConnectAdvancedOptionsProducerCompressionTypeEnum =
  (typeof KafkaConnectAdvancedOptionsProducerCompressionTypeEnum)[keyof typeof KafkaConnectAdvancedOptionsProducerCompressionTypeEnum];

/**
 * Check if a given object implements the KafkaConnectAdvancedOptions interface.
 */
export function instanceOfKafkaConnectAdvancedOptions(value: object): value is KafkaConnectAdvancedOptions {
  return true;
}

export function KafkaConnectAdvancedOptionsFromJSON(json: any): KafkaConnectAdvancedOptions {
  return KafkaConnectAdvancedOptionsFromJSONTyped(json, false);
}

export function KafkaConnectAdvancedOptionsFromJSONTyped(json: any, ignoreDiscriminator: boolean): KafkaConnectAdvancedOptions {
  if (json == null) {
    return json;
  }
  return {
    connectorClientConfigOverridePolicy:
      json['connector_client_config_override_policy'] == null ? undefined : json['connector_client_config_override_policy'],
    consumerAutoOffsetReset: json['consumer_auto_offset_reset'] == null ? undefined : json['consumer_auto_offset_reset'],
    consumerFetchMaxBytes: json['consumer_fetch_max_bytes'] == null ? undefined : json['consumer_fetch_max_bytes'],
    consumerIsolationLevel: json['consumer_isolation_level'] == null ? undefined : json['consumer_isolation_level'],
    consumerMaxPartitionFetchBytes:
      json['consumer_max_partition_fetch_bytes'] == null ? undefined : json['consumer_max_partition_fetch_bytes'],
    consumerMaxPollIntervalMs: json['consumer_max_poll_interval_ms'] == null ? undefined : json['consumer_max_poll_interval_ms'],
    consumerMaxPollRecords: json['consumer_max_poll_records'] == null ? undefined : json['consumer_max_poll_records'],
    offsetFlushIntervalMs: json['offset_flush_interval_ms'] == null ? undefined : json['offset_flush_interval_ms'],
    offsetFlushTimeoutMs: json['offset_flush_timeout_ms'] == null ? undefined : json['offset_flush_timeout_ms'],
    producerBatchSize: json['producer_batch_size'] == null ? undefined : json['producer_batch_size'],
    producerBufferMemory: json['producer_buffer_memory'] == null ? undefined : json['producer_buffer_memory'],
    producerCompressionType: json['producer_compression_type'] == null ? undefined : json['producer_compression_type'],
    producerLingerMs: json['producer_linger_ms'] == null ? undefined : json['producer_linger_ms'],
    producerMaxRequestSize: json['producer_max_request_size'] == null ? undefined : json['producer_max_request_size'],
    scheduledRebalanceMaxDelayMs: json['scheduled_rebalance_max_delay_ms'] == null ? undefined : json['scheduled_rebalance_max_delay_ms'],
    sessionTimeoutMs: json['session_timeout_ms'] == null ? undefined : json['session_timeout_ms'],
  };
}

export function KafkaConnectAdvancedOptionsToJSON(json: any): KafkaConnectAdvancedOptions {
  return KafkaConnectAdvancedOptionsToJSONTyped(json, false);
}

export function KafkaConnectAdvancedOptionsToJSONTyped(
  value?: KafkaConnectAdvancedOptions | null,
  ignoreDiscriminator: boolean = false,
): any {
  if (value == null) {
    return value;
  }

  return {
    connector_client_config_override_policy: value['connectorClientConfigOverridePolicy'],
    consumer_auto_offset_reset: value['consumerAutoOffsetReset'],
    consumer_fetch_max_bytes: value['consumerFetchMaxBytes'],
    consumer_isolation_level: value['consumerIsolationLevel'],
    consumer_max_partition_fetch_bytes: value['consumerMaxPartitionFetchBytes'],
    consumer_max_poll_interval_ms: value['consumerMaxPollIntervalMs'],
    consumer_max_poll_records: value['consumerMaxPollRecords'],
    offset_flush_interval_ms: value['offsetFlushIntervalMs'],
    offset_flush_timeout_ms: value['offsetFlushTimeoutMs'],
    producer_batch_size: value['producerBatchSize'],
    producer_buffer_memory: value['producerBufferMemory'],
    producer_compression_type: value['producerCompressionType'],
    producer_linger_ms: value['producerLingerMs'],
    producer_max_request_size: value['producerMaxRequestSize'],
    scheduled_rebalance_max_delay_ms: value['scheduledRebalanceMaxDelayMs'],
    session_timeout_ms: value['sessionTimeoutMs'],
  };
}
