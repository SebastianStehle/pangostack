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
 * Managed Database PostgreSQL Advanced Options
 * @export
 * @interface PgAdvancedOptions
 */
export interface PgAdvancedOptions {
  /**
   * Accepted values: 0 - 1
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  autovacuumAnalyzeScaleFactor?: number;
  /**
   * Accepted values: 0 - 2147483647
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  autovacuumAnalyzeThreshold?: number;
  /**
   * Accepted values: 200000000 - 1500000000
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  autovacuumFreezeMaxAge?: number;
  /**
   * Accepted values: 1 - 20
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  autovacuumMaxWorkers?: number;
  /**
   * Accepted values: 1 - 86400
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  autovacuumNaptime?: number;
  /**
   * Accepted values: -1 - 100
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  autovacuumVacuumCostDelay?: number;
  /**
   * Accepted values: -1 - 10000
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  autovacuumVacuumCostLimit?: number;
  /**
   * Accepted values: 0 - 1
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  autovacuumVacuumScaleFactor?: number;
  /**
   * Accepted values: 0 - 2147483647
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  autovacuumVacuumThreshold?: number;
  /**
   * Accepted values: 10 - 10000
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  bgwriterDelay?: number;
  /**
   * Accepted values: 0 - 2048
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  bgwriterFlushAfter?: number;
  /**
   * Accepted values: 0 - 1073741823
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  bgwriterLruMaxpages?: number;
  /**
   * Accepted values: 0 - 10
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  bgwriterLruMultiplier?: number;
  /**
   * Accepted values: 500 - 1800000
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  deadlockTimeout?: number;
  /**
   *
   * @type {string}
   * @memberof PgAdvancedOptions
   */
  defaultToastCompression?: PgAdvancedOptionsDefaultToastCompressionEnum;
  /**
   * Accepted values: 0 - 604800000
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  idleInTransactionSessionTimeout?: number;
  /**
   *
   * @type {boolean}
   * @memberof PgAdvancedOptions
   */
  jit?: boolean;
  /**
   * Accepted values: -1 - 2147483647
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  logAutovacuumMinDuration?: number;
  /**
   *
   * @type {string}
   * @memberof PgAdvancedOptions
   */
  logErrorVerbosity?: PgAdvancedOptionsLogErrorVerbosityEnum;
  /**
   *
   * @type {string}
   * @memberof PgAdvancedOptions
   */
  logLinePrefix?: PgAdvancedOptionsLogLinePrefixEnum;
  /**
   * Accepted values: -1 - 86400000
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  logMinDurationStatement?: number;
  /**
   * Accepted values: 1000 - 4096
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  maxFilesPerProcess?: number;
  /**
   * Accepted values: 64 - 6400
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  maxLocksPerTransaction?: number;
  /**
   * Accepted values: 4 - 64
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  maxLogicalReplicationWorkers?: number;
  /**
   * Accepted values: 0 - 96
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  maxParallelWorkers?: number;
  /**
   * Accepted values: 0 - 96
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  maxParallelWorkersPerGather?: number;
  /**
   * Accepted values: 64 - 5120
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  maxPredLocksPerTransaction?: number;
  /**
   * Accepted values: 0 - 10000
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  maxPreparedTransactions?: number;
  /**
   * Accepted values: 8 - 64
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  maxReplicationSlots?: number;
  /**
   * Accepted values: 2097152 - 6291456
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  maxStackDepth?: number;
  /**
   * Accepted values: 1 - 43200000
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  maxStandbyArchiveDelay?: number;
  /**
   * Accepted values: 1 - 43200000
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  maxStandbyStreamingDelay?: number;
  /**
   * Accepted values: 20 - 64
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  maxWalSenders?: number;
  /**
   * Accepted values: 8 - 96
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  maxWorkerProcesses?: number;
  /**
   * Accepted values: 3600 - 604800
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  pgPartmanBgwInterval?: number;
  /**
   * Maximum length: 64 characters
   * @type {string}
   * @memberof PgAdvancedOptions
   */
  pgPartmanBgwRole?: string;
  /**
   *
   * @type {string}
   * @memberof PgAdvancedOptions
   */
  pgStatStatementsTrack?: PgAdvancedOptionsPgStatStatementsTrackEnum;
  /**
   * Accepted values: -1 - 2147483647
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  tempFileLimit?: number;
  /**
   * Accepted values: 1024 - 10240
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  trackActivityQuerySize?: number;
  /**
   *
   * @type {string}
   * @memberof PgAdvancedOptions
   */
  trackCommitTimestamp?: PgAdvancedOptionsTrackCommitTimestampEnum;
  /**
   *
   * @type {string}
   * @memberof PgAdvancedOptions
   */
  trackFunctions?: PgAdvancedOptionsTrackFunctionsEnum;
  /**
   *
   * @type {string}
   * @memberof PgAdvancedOptions
   */
  trackIoTiming?: PgAdvancedOptionsTrackIoTimingEnum;
  /**
   * Accepted values: 0, 5000 - 10800000
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  walSenderTimeout?: number;
  /**
   * Accepted values: 10 - 200
   * @type {number}
   * @memberof PgAdvancedOptions
   */
  walWriterDelay?: number;
}

/**
 * @export
 */
export const PgAdvancedOptionsDefaultToastCompressionEnum = {
  Lz4: 'lz4',
  Pglz: 'pglz',
} as const;
export type PgAdvancedOptionsDefaultToastCompressionEnum =
  (typeof PgAdvancedOptionsDefaultToastCompressionEnum)[keyof typeof PgAdvancedOptionsDefaultToastCompressionEnum];

/**
 * @export
 */
export const PgAdvancedOptionsLogErrorVerbosityEnum = {
  Terse: 'TERSE',
  Default: 'DEFAULT',
  Verbose: 'VERBOSE',
} as const;
export type PgAdvancedOptionsLogErrorVerbosityEnum =
  (typeof PgAdvancedOptionsLogErrorVerbosityEnum)[keyof typeof PgAdvancedOptionsLogErrorVerbosityEnum];

/**
 * @export
 */
export const PgAdvancedOptionsLogLinePrefixEnum = {
  Pidpuserudbdappaclienth: "'pid=%p,user=%u,db=%d,app=%a,client=%h '",
  TPL1Userudbdappaclienth: "'%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '",
  MPQUserudbdappa: "'%m [%p] %q[user=%u,db=%d,app=%a] '",
} as const;
export type PgAdvancedOptionsLogLinePrefixEnum =
  (typeof PgAdvancedOptionsLogLinePrefixEnum)[keyof typeof PgAdvancedOptionsLogLinePrefixEnum];

/**
 * @export
 */
export const PgAdvancedOptionsPgStatStatementsTrackEnum = {
  All: 'all',
  Top: 'top',
  None: 'none',
} as const;
export type PgAdvancedOptionsPgStatStatementsTrackEnum =
  (typeof PgAdvancedOptionsPgStatStatementsTrackEnum)[keyof typeof PgAdvancedOptionsPgStatStatementsTrackEnum];

/**
 * @export
 */
export const PgAdvancedOptionsTrackCommitTimestampEnum = {
  Off: 'off',
  On: 'on',
} as const;
export type PgAdvancedOptionsTrackCommitTimestampEnum =
  (typeof PgAdvancedOptionsTrackCommitTimestampEnum)[keyof typeof PgAdvancedOptionsTrackCommitTimestampEnum];

/**
 * @export
 */
export const PgAdvancedOptionsTrackFunctionsEnum = {
  All: 'all',
  Pl: 'pl',
  None: 'none',
} as const;
export type PgAdvancedOptionsTrackFunctionsEnum =
  (typeof PgAdvancedOptionsTrackFunctionsEnum)[keyof typeof PgAdvancedOptionsTrackFunctionsEnum];

/**
 * @export
 */
export const PgAdvancedOptionsTrackIoTimingEnum = {
  Off: 'off',
  On: 'on',
} as const;
export type PgAdvancedOptionsTrackIoTimingEnum =
  (typeof PgAdvancedOptionsTrackIoTimingEnum)[keyof typeof PgAdvancedOptionsTrackIoTimingEnum];

/**
 * Check if a given object implements the PgAdvancedOptions interface.
 */
export function instanceOfPgAdvancedOptions(value: object): value is PgAdvancedOptions {
  return true;
}

export function PgAdvancedOptionsFromJSON(json: any): PgAdvancedOptions {
  return PgAdvancedOptionsFromJSONTyped(json, false);
}

export function PgAdvancedOptionsFromJSONTyped(json: any, ignoreDiscriminator: boolean): PgAdvancedOptions {
  if (json == null) {
    return json;
  }
  return {
    autovacuumAnalyzeScaleFactor: json['autovacuum_analyze_scale_factor'] == null ? undefined : json['autovacuum_analyze_scale_factor'],
    autovacuumAnalyzeThreshold: json['autovacuum_analyze_threshold'] == null ? undefined : json['autovacuum_analyze_threshold'],
    autovacuumFreezeMaxAge: json['autovacuum_freeze_max_age'] == null ? undefined : json['autovacuum_freeze_max_age'],
    autovacuumMaxWorkers: json['autovacuum_max_workers'] == null ? undefined : json['autovacuum_max_workers'],
    autovacuumNaptime: json['autovacuum_naptime'] == null ? undefined : json['autovacuum_naptime'],
    autovacuumVacuumCostDelay: json['autovacuum_vacuum_cost_delay'] == null ? undefined : json['autovacuum_vacuum_cost_delay'],
    autovacuumVacuumCostLimit: json['autovacuum_vacuum_cost_limit'] == null ? undefined : json['autovacuum_vacuum_cost_limit'],
    autovacuumVacuumScaleFactor: json['autovacuum_vacuum_scale_factor'] == null ? undefined : json['autovacuum_vacuum_scale_factor'],
    autovacuumVacuumThreshold: json['autovacuum_vacuum_threshold'] == null ? undefined : json['autovacuum_vacuum_threshold'],
    bgwriterDelay: json['bgwriter_delay'] == null ? undefined : json['bgwriter_delay'],
    bgwriterFlushAfter: json['bgwriter_flush_after'] == null ? undefined : json['bgwriter_flush_after'],
    bgwriterLruMaxpages: json['bgwriter_lru_maxpages'] == null ? undefined : json['bgwriter_lru_maxpages'],
    bgwriterLruMultiplier: json['bgwriter_lru_multiplier'] == null ? undefined : json['bgwriter_lru_multiplier'],
    deadlockTimeout: json['deadlock_timeout'] == null ? undefined : json['deadlock_timeout'],
    defaultToastCompression: json['default_toast_compression'] == null ? undefined : json['default_toast_compression'],
    idleInTransactionSessionTimeout:
      json['idle_in_transaction_session_timeout'] == null ? undefined : json['idle_in_transaction_session_timeout'],
    jit: json['jit'] == null ? undefined : json['jit'],
    logAutovacuumMinDuration: json['log_autovacuum_min_duration'] == null ? undefined : json['log_autovacuum_min_duration'],
    logErrorVerbosity: json['log_error_verbosity'] == null ? undefined : json['log_error_verbosity'],
    logLinePrefix: json['log_line_prefix'] == null ? undefined : json['log_line_prefix'],
    logMinDurationStatement: json['log_min_duration_statement'] == null ? undefined : json['log_min_duration_statement'],
    maxFilesPerProcess: json['max_files_per_process'] == null ? undefined : json['max_files_per_process'],
    maxLocksPerTransaction: json['max_locks_per_transaction'] == null ? undefined : json['max_locks_per_transaction'],
    maxLogicalReplicationWorkers: json['max_logical_replication_workers'] == null ? undefined : json['max_logical_replication_workers'],
    maxParallelWorkers: json['max_parallel_workers'] == null ? undefined : json['max_parallel_workers'],
    maxParallelWorkersPerGather: json['max_parallel_workers_per_gather'] == null ? undefined : json['max_parallel_workers_per_gather'],
    maxPredLocksPerTransaction: json['max_pred_locks_per_transaction'] == null ? undefined : json['max_pred_locks_per_transaction'],
    maxPreparedTransactions: json['max_prepared_transactions'] == null ? undefined : json['max_prepared_transactions'],
    maxReplicationSlots: json['max_replication_slots'] == null ? undefined : json['max_replication_slots'],
    maxStackDepth: json['max_stack_depth'] == null ? undefined : json['max_stack_depth'],
    maxStandbyArchiveDelay: json['max_standby_archive_delay'] == null ? undefined : json['max_standby_archive_delay'],
    maxStandbyStreamingDelay: json['max_standby_streaming_delay'] == null ? undefined : json['max_standby_streaming_delay'],
    maxWalSenders: json['max_wal_senders'] == null ? undefined : json['max_wal_senders'],
    maxWorkerProcesses: json['max_worker_processes'] == null ? undefined : json['max_worker_processes'],
    pgPartmanBgwInterval: json['pg_partman_bgw.interval'] == null ? undefined : json['pg_partman_bgw.interval'],
    pgPartmanBgwRole: json['pg_partman_bgw.role'] == null ? undefined : json['pg_partman_bgw.role'],
    pgStatStatementsTrack: json['pg_stat_statements.track'] == null ? undefined : json['pg_stat_statements.track'],
    tempFileLimit: json['temp_file_limit'] == null ? undefined : json['temp_file_limit'],
    trackActivityQuerySize: json['track_activity_query_size'] == null ? undefined : json['track_activity_query_size'],
    trackCommitTimestamp: json['track_commit_timestamp'] == null ? undefined : json['track_commit_timestamp'],
    trackFunctions: json['track_functions'] == null ? undefined : json['track_functions'],
    trackIoTiming: json['track_io_timing'] == null ? undefined : json['track_io_timing'],
    walSenderTimeout: json['wal_sender_timeout'] == null ? undefined : json['wal_sender_timeout'],
    walWriterDelay: json['wal_writer_delay'] == null ? undefined : json['wal_writer_delay'],
  };
}

export function PgAdvancedOptionsToJSON(json: any): PgAdvancedOptions {
  return PgAdvancedOptionsToJSONTyped(json, false);
}

export function PgAdvancedOptionsToJSONTyped(value?: PgAdvancedOptions | null, ignoreDiscriminator: boolean = false): any {
  if (value == null) {
    return value;
  }

  return {
    autovacuum_analyze_scale_factor: value['autovacuumAnalyzeScaleFactor'],
    autovacuum_analyze_threshold: value['autovacuumAnalyzeThreshold'],
    autovacuum_freeze_max_age: value['autovacuumFreezeMaxAge'],
    autovacuum_max_workers: value['autovacuumMaxWorkers'],
    autovacuum_naptime: value['autovacuumNaptime'],
    autovacuum_vacuum_cost_delay: value['autovacuumVacuumCostDelay'],
    autovacuum_vacuum_cost_limit: value['autovacuumVacuumCostLimit'],
    autovacuum_vacuum_scale_factor: value['autovacuumVacuumScaleFactor'],
    autovacuum_vacuum_threshold: value['autovacuumVacuumThreshold'],
    bgwriter_delay: value['bgwriterDelay'],
    bgwriter_flush_after: value['bgwriterFlushAfter'],
    bgwriter_lru_maxpages: value['bgwriterLruMaxpages'],
    bgwriter_lru_multiplier: value['bgwriterLruMultiplier'],
    deadlock_timeout: value['deadlockTimeout'],
    default_toast_compression: value['defaultToastCompression'],
    idle_in_transaction_session_timeout: value['idleInTransactionSessionTimeout'],
    jit: value['jit'],
    log_autovacuum_min_duration: value['logAutovacuumMinDuration'],
    log_error_verbosity: value['logErrorVerbosity'],
    log_line_prefix: value['logLinePrefix'],
    log_min_duration_statement: value['logMinDurationStatement'],
    max_files_per_process: value['maxFilesPerProcess'],
    max_locks_per_transaction: value['maxLocksPerTransaction'],
    max_logical_replication_workers: value['maxLogicalReplicationWorkers'],
    max_parallel_workers: value['maxParallelWorkers'],
    max_parallel_workers_per_gather: value['maxParallelWorkersPerGather'],
    max_pred_locks_per_transaction: value['maxPredLocksPerTransaction'],
    max_prepared_transactions: value['maxPreparedTransactions'],
    max_replication_slots: value['maxReplicationSlots'],
    max_stack_depth: value['maxStackDepth'],
    max_standby_archive_delay: value['maxStandbyArchiveDelay'],
    max_standby_streaming_delay: value['maxStandbyStreamingDelay'],
    max_wal_senders: value['maxWalSenders'],
    max_worker_processes: value['maxWorkerProcesses'],
    'pg_partman_bgw.interval': value['pgPartmanBgwInterval'],
    'pg_partman_bgw.role': value['pgPartmanBgwRole'],
    'pg_stat_statements.track': value['pgStatStatementsTrack'],
    temp_file_limit: value['tempFileLimit'],
    track_activity_query_size: value['trackActivityQuerySize'],
    track_commit_timestamp: value['trackCommitTimestamp'],
    track_functions: value['trackFunctions'],
    track_io_timing: value['trackIoTiming'],
    wal_sender_timeout: value['walSenderTimeout'],
    wal_writer_delay: value['walWriterDelay'],
  };
}
