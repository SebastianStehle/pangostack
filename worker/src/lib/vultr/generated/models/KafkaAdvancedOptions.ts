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
 * Managed Database Kafka Advanced Options
 * @export
 * @interface KafkaAdvancedOptions
 */
export interface KafkaAdvancedOptions {
  /**
   *
   * @type {string}
   * @memberof KafkaAdvancedOptions
   */
  compressionType?: KafkaAdvancedOptionsCompressionTypeEnum;
  /**
   * Accepted values: 1 - 300000
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  groupInitialRebalanceDelayMs?: number;
  /**
   * Accepted values: 1 - 60000
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  groupMinSessionTimeoutMs?: number;
  /**
   * Accepted values: 1 - 1800000
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  groupMaxSessionTimeoutMs?: number;
  /**
   * Accepted values: 1000 - 3600000
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  connectionsMaxIdleMs?: number;
  /**
   * Accepted values: 1000 - 10000
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  maxIncrementalFetchSessionCacheSlots?: number;
  /**
   * Accepted values: 1 - 100001200
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  messageMaxBytes?: number;
  /**
   * Accepted values: 1 - 2147483647
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  offsetsRetentionMinutes?: number;
  /**
   * Accepted values: 1 - 315569260000
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  logCleanerDeleteRetentionMs?: number;
  /**
   * Accepted values: 0.2 - 0.9
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  logCleanerMinCleanableRatio?: number;
  /**
   * Accepted values: 30000 - 922337203685477600
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  logCleanerMaxCompactionLagMs?: number;
  /**
   * Accepted values: 1 - 922337203685477600
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  logCleanerMinCompactionLagMs?: number;
  /**
   * The default cleanup policy for segments beyond the retention window.
   * @type {string}
   * @memberof KafkaAdvancedOptions
   */
  logCleanupPolicy?: string;
  /**
   * Accepted values: 1 - 922337203685477600
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  logFlushIntervalMessages?: number;
  /**
   * Accepted values: 1 - 922337203685477600
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  logFlushIntervalMs?: number;
  /**
   * Accepted values: 1 - 104857600
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  logIndexIntervalBytes?: number;
  /**
   * Accepted values: 1048576 - 104857600
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  logIndexSizeMaxBytes?: number;
  /**
   * TIf set to -2, the value of `log_retention_ms` is used. Accepted values: =2 - 922337203685477600
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  logLocalRetentionMs?: number;
  /**
   * If set to -2, the value of `log_retention_bytes` is used. Accepted values: -2 - 922337203685477600
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  logLocalRetentionBytes?: number;
  /**
   *
   * @type {boolean}
   * @memberof KafkaAdvancedOptions
   */
  logMessageDownconversionEnable?: boolean;
  /**
   * Define whether the timestamp in the message is message create time or log append time.
   * @type {string}
   * @memberof KafkaAdvancedOptions
   */
  logMessageTimestampType?: string;
  /**
   * Accepted values: 1 - 922337203685477600
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  logMessageTimestampDifferenceMaxMs?: number;
  /**
   *
   * @type {boolean}
   * @memberof KafkaAdvancedOptions
   */
  logPreallocate?: boolean;
  /**
   * Accepted values: -1 - 922337203685477600
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  logRetentionBytes?: number;
  /**
   * Accepted values: -1 - 2147483647
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  logRetentionHours?: number;
  /**
   * Accepted values: -1 - 922337203685477600
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  logRetentionMs?: number;
  /**
   * Accepted values: 1 - 922337203685477600
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  logRollJitterMs?: number;
  /**
   * Accepted values: 1 - 922337203685477600
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  logRollMs?: number;
  /**
   * Accepted values: 10485760 - 1073741824
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  logSegmentBytes?: number;
  /**
   * Accepted values: 1 - 3600000
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  logSegmentDeleteDelayMs?: number;
  /**
   *
   * @type {boolean}
   * @memberof KafkaAdvancedOptions
   */
  autoCreateTopicsEnable?: boolean;
  /**
   * Accepted values: 1 - 7
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  minInsyncReplicas?: number;
  /**
   * Accepted values: 1 - 1000
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  numPartitions?: number;
  /**
   * Accepted values: 1 - 10
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  defaultReplicationFactor?: number;
  /**
   * Accepted values: 1048576 - 104857600
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  replicaFetchMaxBytes?: number;
  /**
   * Accepted values: 10485760 - 1048576000
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  replicaFetchResponseMaxBytes?: number;
  /**
   * Accepted values: 256 - 2147483647
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  maxConnectionsPerIp?: number;
  /**
   * Accepted values: 10 - 10000
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  producerPurgatoryPurgeIntervalRequests?: number;
  /**
   * The (optional) comma-delimited setting for the broker to use to verify that the JWT was issued for one of the expected audiences.
   * @type {string}
   * @memberof KafkaAdvancedOptions
   */
  saslOauthbearerExpectedAudience?: string;
  /**
   * Optional setting for the broker to use to verify that the JWT was created by the expected issuer.
   * @type {string}
   * @memberof KafkaAdvancedOptions
   */
  saslOauthbearerExpectedIssuer?: string;
  /**
   * OIDC JWKS endpoint URL. By setting this the SASL SSL OAuth2/OIDC authentication is enabled.
   * @type {string}
   * @memberof KafkaAdvancedOptions
   */
  saslOauthbearerJwksEndpointUrl?: string;
  /**
   * Name of the scope from which to extract the subject claim from the JWT.
   * @type {string}
   * @memberof KafkaAdvancedOptions
   */
  saslOauthbearerSubClaimName?: string;
  /**
   * Accepted values: 10485760 - 209715200
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  socketRequestMaxBytes?: number;
  /**
   * Accepted values: 1048576 - 2147483647
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  transactionStateLogSegmentBytes?: number;
  /**
   * Accepted values: 600000 - 3600000
   * @type {number}
   * @memberof KafkaAdvancedOptions
   */
  transactionRemoveExpiredTransactionCleanupIntervalMs?: number;
  /**
   *
   * @type {boolean}
   * @memberof KafkaAdvancedOptions
   */
  transactionPartitionVerificationEnable?: boolean;
}

/**
 * @export
 */
export const KafkaAdvancedOptionsCompressionTypeEnum = {
  Producer: 'producer',
  Gzip: 'gzip',
  Snappy: 'snappy',
  Lz4: 'lz4',
  Zstd: 'zstd',
  Uncompressed: 'uncompressed',
} as const;
export type KafkaAdvancedOptionsCompressionTypeEnum =
  (typeof KafkaAdvancedOptionsCompressionTypeEnum)[keyof typeof KafkaAdvancedOptionsCompressionTypeEnum];

/**
 * Check if a given object implements the KafkaAdvancedOptions interface.
 */
export function instanceOfKafkaAdvancedOptions(value: object): value is KafkaAdvancedOptions {
  return true;
}

export function KafkaAdvancedOptionsFromJSON(json: any): KafkaAdvancedOptions {
  return KafkaAdvancedOptionsFromJSONTyped(json, false);
}

export function KafkaAdvancedOptionsFromJSONTyped(json: any, ignoreDiscriminator: boolean): KafkaAdvancedOptions {
  if (json == null) {
    return json;
  }
  return {
    compressionType: json['compression_type'] == null ? undefined : json['compression_type'],
    groupInitialRebalanceDelayMs: json['group_initial_rebalance_delay_ms'] == null ? undefined : json['group_initial_rebalance_delay_ms'],
    groupMinSessionTimeoutMs: json['group_min_session_timeout_ms'] == null ? undefined : json['group_min_session_timeout_ms'],
    groupMaxSessionTimeoutMs: json['group_max_session_timeout_ms'] == null ? undefined : json['group_max_session_timeout_ms'],
    connectionsMaxIdleMs: json['connections_max_idle_ms'] == null ? undefined : json['connections_max_idle_ms'],
    maxIncrementalFetchSessionCacheSlots:
      json['max_incremental_fetch_session_cache_slots'] == null ? undefined : json['max_incremental_fetch_session_cache_slots'],
    messageMaxBytes: json['message_max_bytes'] == null ? undefined : json['message_max_bytes'],
    offsetsRetentionMinutes: json['offsets_retention_minutes'] == null ? undefined : json['offsets_retention_minutes'],
    logCleanerDeleteRetentionMs: json['log_cleaner_delete_retention_ms'] == null ? undefined : json['log_cleaner_delete_retention_ms'],
    logCleanerMinCleanableRatio: json['log_cleaner_min_cleanable_ratio'] == null ? undefined : json['log_cleaner_min_cleanable_ratio'],
    logCleanerMaxCompactionLagMs: json['log_cleaner_max_compaction_lag_ms'] == null ? undefined : json['log_cleaner_max_compaction_lag_ms'],
    logCleanerMinCompactionLagMs: json['log_cleaner_min_compaction_lag_ms'] == null ? undefined : json['log_cleaner_min_compaction_lag_ms'],
    logCleanupPolicy: json['log_cleanup_policy'] == null ? undefined : json['log_cleanup_policy'],
    logFlushIntervalMessages: json['log_flush_interval_messages'] == null ? undefined : json['log_flush_interval_messages'],
    logFlushIntervalMs: json['log_flush_interval_ms'] == null ? undefined : json['log_flush_interval_ms'],
    logIndexIntervalBytes: json['log_index_interval_bytes'] == null ? undefined : json['log_index_interval_bytes'],
    logIndexSizeMaxBytes: json['log_index_size_max_bytes'] == null ? undefined : json['log_index_size_max_bytes'],
    logLocalRetentionMs: json['log_local_retention_ms'] == null ? undefined : json['log_local_retention_ms'],
    logLocalRetentionBytes: json['log_local_retention_bytes'] == null ? undefined : json['log_local_retention_bytes'],
    logMessageDownconversionEnable:
      json['log_message_downconversion_enable'] == null ? undefined : json['log_message_downconversion_enable'],
    logMessageTimestampType: json['log_message_timestamp_type'] == null ? undefined : json['log_message_timestamp_type'],
    logMessageTimestampDifferenceMaxMs:
      json['log_message_timestamp_difference_max_ms'] == null ? undefined : json['log_message_timestamp_difference_max_ms'],
    logPreallocate: json['log_preallocate'] == null ? undefined : json['log_preallocate'],
    logRetentionBytes: json['log_retention_bytes'] == null ? undefined : json['log_retention_bytes'],
    logRetentionHours: json['log_retention_hours'] == null ? undefined : json['log_retention_hours'],
    logRetentionMs: json['log_retention_ms'] == null ? undefined : json['log_retention_ms'],
    logRollJitterMs: json['log_roll_jitter_ms'] == null ? undefined : json['log_roll_jitter_ms'],
    logRollMs: json['log_roll_ms'] == null ? undefined : json['log_roll_ms'],
    logSegmentBytes: json['log_segment_bytes'] == null ? undefined : json['log_segment_bytes'],
    logSegmentDeleteDelayMs: json['log_segment_delete_delay_ms'] == null ? undefined : json['log_segment_delete_delay_ms'],
    autoCreateTopicsEnable: json['auto_create_topics_enable'] == null ? undefined : json['auto_create_topics_enable'],
    minInsyncReplicas: json['min_insync_replicas'] == null ? undefined : json['min_insync_replicas'],
    numPartitions: json['num_partitions'] == null ? undefined : json['num_partitions'],
    defaultReplicationFactor: json['default_replication_factor'] == null ? undefined : json['default_replication_factor'],
    replicaFetchMaxBytes: json['replica_fetch_max_bytes'] == null ? undefined : json['replica_fetch_max_bytes'],
    replicaFetchResponseMaxBytes: json['replica_fetch_response_max_bytes'] == null ? undefined : json['replica_fetch_response_max_bytes'],
    maxConnectionsPerIp: json['max_connections_per_ip'] == null ? undefined : json['max_connections_per_ip'],
    producerPurgatoryPurgeIntervalRequests:
      json['producer_purgatory_purge_interval_requests'] == null ? undefined : json['producer_purgatory_purge_interval_requests'],
    saslOauthbearerExpectedAudience:
      json['sasl_oauthbearer_expected_audience'] == null ? undefined : json['sasl_oauthbearer_expected_audience'],
    saslOauthbearerExpectedIssuer: json['sasl_oauthbearer_expected_issuer'] == null ? undefined : json['sasl_oauthbearer_expected_issuer'],
    saslOauthbearerJwksEndpointUrl:
      json['sasl_oauthbearer_jwks_endpoint_url'] == null ? undefined : json['sasl_oauthbearer_jwks_endpoint_url'],
    saslOauthbearerSubClaimName: json['sasl_oauthbearer_sub_claim_name'] == null ? undefined : json['sasl_oauthbearer_sub_claim_name'],
    socketRequestMaxBytes: json['socket_request_max_bytes'] == null ? undefined : json['socket_request_max_bytes'],
    transactionStateLogSegmentBytes:
      json['transaction_state_log_segment_bytes'] == null ? undefined : json['transaction_state_log_segment_bytes'],
    transactionRemoveExpiredTransactionCleanupIntervalMs:
      json['transaction_remove_expired_transaction_cleanup_interval_ms'] == null
        ? undefined
        : json['transaction_remove_expired_transaction_cleanup_interval_ms'],
    transactionPartitionVerificationEnable:
      json['transaction_partition_verification_enable'] == null ? undefined : json['transaction_partition_verification_enable'],
  };
}

export function KafkaAdvancedOptionsToJSON(json: any): KafkaAdvancedOptions {
  return KafkaAdvancedOptionsToJSONTyped(json, false);
}

export function KafkaAdvancedOptionsToJSONTyped(value?: KafkaAdvancedOptions | null, ignoreDiscriminator: boolean = false): any {
  if (value == null) {
    return value;
  }

  return {
    compression_type: value['compressionType'],
    group_initial_rebalance_delay_ms: value['groupInitialRebalanceDelayMs'],
    group_min_session_timeout_ms: value['groupMinSessionTimeoutMs'],
    group_max_session_timeout_ms: value['groupMaxSessionTimeoutMs'],
    connections_max_idle_ms: value['connectionsMaxIdleMs'],
    max_incremental_fetch_session_cache_slots: value['maxIncrementalFetchSessionCacheSlots'],
    message_max_bytes: value['messageMaxBytes'],
    offsets_retention_minutes: value['offsetsRetentionMinutes'],
    log_cleaner_delete_retention_ms: value['logCleanerDeleteRetentionMs'],
    log_cleaner_min_cleanable_ratio: value['logCleanerMinCleanableRatio'],
    log_cleaner_max_compaction_lag_ms: value['logCleanerMaxCompactionLagMs'],
    log_cleaner_min_compaction_lag_ms: value['logCleanerMinCompactionLagMs'],
    log_cleanup_policy: value['logCleanupPolicy'],
    log_flush_interval_messages: value['logFlushIntervalMessages'],
    log_flush_interval_ms: value['logFlushIntervalMs'],
    log_index_interval_bytes: value['logIndexIntervalBytes'],
    log_index_size_max_bytes: value['logIndexSizeMaxBytes'],
    log_local_retention_ms: value['logLocalRetentionMs'],
    log_local_retention_bytes: value['logLocalRetentionBytes'],
    log_message_downconversion_enable: value['logMessageDownconversionEnable'],
    log_message_timestamp_type: value['logMessageTimestampType'],
    log_message_timestamp_difference_max_ms: value['logMessageTimestampDifferenceMaxMs'],
    log_preallocate: value['logPreallocate'],
    log_retention_bytes: value['logRetentionBytes'],
    log_retention_hours: value['logRetentionHours'],
    log_retention_ms: value['logRetentionMs'],
    log_roll_jitter_ms: value['logRollJitterMs'],
    log_roll_ms: value['logRollMs'],
    log_segment_bytes: value['logSegmentBytes'],
    log_segment_delete_delay_ms: value['logSegmentDeleteDelayMs'],
    auto_create_topics_enable: value['autoCreateTopicsEnable'],
    min_insync_replicas: value['minInsyncReplicas'],
    num_partitions: value['numPartitions'],
    default_replication_factor: value['defaultReplicationFactor'],
    replica_fetch_max_bytes: value['replicaFetchMaxBytes'],
    replica_fetch_response_max_bytes: value['replicaFetchResponseMaxBytes'],
    max_connections_per_ip: value['maxConnectionsPerIp'],
    producer_purgatory_purge_interval_requests: value['producerPurgatoryPurgeIntervalRequests'],
    sasl_oauthbearer_expected_audience: value['saslOauthbearerExpectedAudience'],
    sasl_oauthbearer_expected_issuer: value['saslOauthbearerExpectedIssuer'],
    sasl_oauthbearer_jwks_endpoint_url: value['saslOauthbearerJwksEndpointUrl'],
    sasl_oauthbearer_sub_claim_name: value['saslOauthbearerSubClaimName'],
    socket_request_max_bytes: value['socketRequestMaxBytes'],
    transaction_state_log_segment_bytes: value['transactionStateLogSegmentBytes'],
    transaction_remove_expired_transaction_cleanup_interval_ms: value['transactionRemoveExpiredTransactionCleanupIntervalMs'],
    transaction_partition_verification_enable: value['transactionPartitionVerificationEnable'],
  };
}
