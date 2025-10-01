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
 * Managed Database MySQL Advanced Options
 * @export
 * @interface MysqlAdvancedOptions
 */
export interface MysqlAdvancedOptions {
  /**
   * Accepted values: 2 - 3600
   * @type {number}
   * @memberof MysqlAdvancedOptions
   */
  connectTimeout?: number;
  /**
   * Accepted values: 4 - 18446744073709552000
   * @type {number}
   * @memberof MysqlAdvancedOptions
   */
  groupConcatMaxLen?: number;
  /**
   * Accepted values: 0 - 50
   * @type {number}
   * @memberof MysqlAdvancedOptions
   */
  innodbChangeBufferMaxSize?: number;
  /**
   * Accepted values: 0 - 2 (0: dirty pages in the same extent are not flushed, 1: flush contiguous dirty pages in the same extent [default], 2: flush dirty pages in the same extent)
   * @type {number}
   * @memberof MysqlAdvancedOptions
   */
  innodbFlushNeighbors?: number;
  /**
   * Accepted values: 0 - 16
   * @type {number}
   * @memberof MysqlAdvancedOptions
   */
  innodbFtMinTokenSize?: number;
  /**
   * This option is used to specify your own InnoDB FULLTEXT index stopword list for all tables.
   * @type {string}
   * @memberof MysqlAdvancedOptions
   */
  innodbFtServerStopwordTable?: string;
  /**
   * Accepted values: 1 - 3600
   * @type {number}
   * @memberof MysqlAdvancedOptions
   */
  innodbLockWaitTimeout?: number;
  /**
   * Accepted values: 1048576 - 4294967295
   * @type {number}
   * @memberof MysqlAdvancedOptions
   */
  innodbLogBufferSize?: number;
  /**
   * Accepted values: 65536 - 1099511627776
   * @type {number}
   * @memberof MysqlAdvancedOptions
   */
  innodbOnlineAlterLogMaxSize?: number;
  /**
   *
   * @type {boolean}
   * @memberof MysqlAdvancedOptions
   */
  innodbPrintAllDeadlocks?: boolean;
  /**
   * Accepted values: 1 - 64
   * @type {number}
   * @memberof MysqlAdvancedOptions
   */
  innodbReadIoThreads?: number;
  /**
   *
   * @type {boolean}
   * @memberof MysqlAdvancedOptions
   */
  innodbRollbackOnTimeout?: boolean;
  /**
   * Accepted values: 0 - 1000
   * @type {number}
   * @memberof MysqlAdvancedOptions
   */
  innodbThreadConcurrency?: number;
  /**
   * Accepted values: 1 - 64
   * @type {number}
   * @memberof MysqlAdvancedOptions
   */
  innodbWriteIoThreads?: number;
  /**
   *
   * @type {string}
   * @memberof MysqlAdvancedOptions
   */
  internalTmpMemStorageEngine?: MysqlAdvancedOptionsInternalTmpMemStorageEngineEnum;
  /**
   * Accepted values: 1024 - 1048576
   * @type {number}
   * @memberof MysqlAdvancedOptions
   */
  netBufferLength?: number;
  /**
   * Accepted values: 1 - 3600
   * @type {number}
   * @memberof MysqlAdvancedOptions
   */
  netReadTimeout?: number;
  /**
   * Accepted values: 1 - 3600
   * @type {number}
   * @memberof MysqlAdvancedOptions
   */
  netWriteTimeout?: number;
  /**
   * Accepted values: 1 - 2147483
   * @type {number}
   * @memberof MysqlAdvancedOptions
   */
  waitTimeout?: number;
  /**
   * Accepted values: 102400 - 1073741824
   * @type {number}
   * @memberof MysqlAdvancedOptions
   */
  maxAllowedPacket?: number;
  /**
   * Accepted values: 1048576 - 1073741824
   * @type {number}
   * @memberof MysqlAdvancedOptions
   */
  maxHeapTableSize?: number;
  /**
   * Accepted values: 32768 - 1073741824
   * @type {number}
   * @memberof MysqlAdvancedOptions
   */
  sortBufferSize?: number;
  /**
   * Accepted values: 1048576 - 1073741824
   * @type {number}
   * @memberof MysqlAdvancedOptions
   */
  tmpTableSize?: number;
}

/**
 * @export
 */
export const MysqlAdvancedOptionsInternalTmpMemStorageEngineEnum = {
  Memory: 'MEMORY',
  TempTable: 'TempTable',
} as const;
export type MysqlAdvancedOptionsInternalTmpMemStorageEngineEnum =
  (typeof MysqlAdvancedOptionsInternalTmpMemStorageEngineEnum)[keyof typeof MysqlAdvancedOptionsInternalTmpMemStorageEngineEnum];

/**
 * Check if a given object implements the MysqlAdvancedOptions interface.
 */
export function instanceOfMysqlAdvancedOptions(value: object): value is MysqlAdvancedOptions {
  return true;
}

export function MysqlAdvancedOptionsFromJSON(json: any): MysqlAdvancedOptions {
  return MysqlAdvancedOptionsFromJSONTyped(json, false);
}

export function MysqlAdvancedOptionsFromJSONTyped(json: any, ignoreDiscriminator: boolean): MysqlAdvancedOptions {
  if (json == null) {
    return json;
  }
  return {
    connectTimeout: json['connect_timeout'] == null ? undefined : json['connect_timeout'],
    groupConcatMaxLen: json['group_concat_max_len'] == null ? undefined : json['group_concat_max_len'],
    innodbChangeBufferMaxSize: json['innodb_change_buffer_max_size'] == null ? undefined : json['innodb_change_buffer_max_size'],
    innodbFlushNeighbors: json['innodb_flush_neighbors'] == null ? undefined : json['innodb_flush_neighbors'],
    innodbFtMinTokenSize: json['innodb_ft_min_token_size'] == null ? undefined : json['innodb_ft_min_token_size'],
    innodbFtServerStopwordTable: json['innodb_ft_server_stopword_table'] == null ? undefined : json['innodb_ft_server_stopword_table'],
    innodbLockWaitTimeout: json['innodb_lock_wait_timeout'] == null ? undefined : json['innodb_lock_wait_timeout'],
    innodbLogBufferSize: json['innodb_log_buffer_size'] == null ? undefined : json['innodb_log_buffer_size'],
    innodbOnlineAlterLogMaxSize: json['innodb_online_alter_log_max_size'] == null ? undefined : json['innodb_online_alter_log_max_size'],
    innodbPrintAllDeadlocks: json['innodb_print_all_deadlocks'] == null ? undefined : json['innodb_print_all_deadlocks'],
    innodbReadIoThreads: json['innodb_read_io_threads'] == null ? undefined : json['innodb_read_io_threads'],
    innodbRollbackOnTimeout: json['innodb_rollback_on_timeout'] == null ? undefined : json['innodb_rollback_on_timeout'],
    innodbThreadConcurrency: json['innodb_thread_concurrency'] == null ? undefined : json['innodb_thread_concurrency'],
    innodbWriteIoThreads: json['innodb_write_io_threads'] == null ? undefined : json['innodb_write_io_threads'],
    internalTmpMemStorageEngine: json['internal_tmp_mem_storage_engine'] == null ? undefined : json['internal_tmp_mem_storage_engine'],
    netBufferLength: json['net_buffer_length'] == null ? undefined : json['net_buffer_length'],
    netReadTimeout: json['net_read_timeout'] == null ? undefined : json['net_read_timeout'],
    netWriteTimeout: json['net_write_timeout'] == null ? undefined : json['net_write_timeout'],
    waitTimeout: json['wait_timeout'] == null ? undefined : json['wait_timeout'],
    maxAllowedPacket: json['max_allowed_packet'] == null ? undefined : json['max_allowed_packet'],
    maxHeapTableSize: json['max_heap_table_size'] == null ? undefined : json['max_heap_table_size'],
    sortBufferSize: json['sort_buffer_size'] == null ? undefined : json['sort_buffer_size'],
    tmpTableSize: json['tmp_table_size'] == null ? undefined : json['tmp_table_size'],
  };
}

export function MysqlAdvancedOptionsToJSON(json: any): MysqlAdvancedOptions {
  return MysqlAdvancedOptionsToJSONTyped(json, false);
}

export function MysqlAdvancedOptionsToJSONTyped(value?: MysqlAdvancedOptions | null, ignoreDiscriminator: boolean = false): any {
  if (value == null) {
    return value;
  }

  return {
    connect_timeout: value['connectTimeout'],
    group_concat_max_len: value['groupConcatMaxLen'],
    innodb_change_buffer_max_size: value['innodbChangeBufferMaxSize'],
    innodb_flush_neighbors: value['innodbFlushNeighbors'],
    innodb_ft_min_token_size: value['innodbFtMinTokenSize'],
    innodb_ft_server_stopword_table: value['innodbFtServerStopwordTable'],
    innodb_lock_wait_timeout: value['innodbLockWaitTimeout'],
    innodb_log_buffer_size: value['innodbLogBufferSize'],
    innodb_online_alter_log_max_size: value['innodbOnlineAlterLogMaxSize'],
    innodb_print_all_deadlocks: value['innodbPrintAllDeadlocks'],
    innodb_read_io_threads: value['innodbReadIoThreads'],
    innodb_rollback_on_timeout: value['innodbRollbackOnTimeout'],
    innodb_thread_concurrency: value['innodbThreadConcurrency'],
    innodb_write_io_threads: value['innodbWriteIoThreads'],
    internal_tmp_mem_storage_engine: value['internalTmpMemStorageEngine'],
    net_buffer_length: value['netBufferLength'],
    net_read_timeout: value['netReadTimeout'],
    net_write_timeout: value['netWriteTimeout'],
    wait_timeout: value['waitTimeout'],
    max_allowed_packet: value['maxAllowedPacket'],
    max_heap_table_size: value['maxHeapTableSize'],
    sort_buffer_size: value['sortBufferSize'],
    tmp_table_size: value['tmpTableSize'],
  };
}
