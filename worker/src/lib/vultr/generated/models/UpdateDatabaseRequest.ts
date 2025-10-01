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
 * @interface UpdateDatabaseRequest
 */
export interface UpdateDatabaseRequest {
  /**
   * The [Region id](#operation/list-regions) where the Managed Database is located.
   * @type {string}
   * @memberof UpdateDatabaseRequest
   */
  region?: string;
  /**
   * The [Plan id](#operation/list-database-plans) for this Managed Database.
   * @type {string}
   * @memberof UpdateDatabaseRequest
   */
  plan?: string;
  /**
   * A user-supplied label for this Managed Database.
   * @type {string}
   * @memberof UpdateDatabaseRequest
   */
  label?: string;
  /**
   * The user-supplied tag for this Managed Database.
   * @type {string}
   * @memberof UpdateDatabaseRequest
   */
  tag?: string;
  /**
   * The [VPC id](#operation/list-vpcs) for this Managed Database.
   * @type {string}
   * @memberof UpdateDatabaseRequest
   */
  vpcId?: string;
  /**
   * The day of week for routine maintenance updates.
   * * `monday`
   * * `tuesday`
   * * `wednesday`
   * * `thursday`
   * * `friday`
   * * `saturday`
   * * `sunday`
   * @type {string}
   * @memberof UpdateDatabaseRequest
   */
  maintenanceDow?: string;
  /**
   * The preferred time (UTC) for routine maintenance updates to occur in 24-hour HH:00 format (e.g. `01:00`, `13:00`, `23:00`, etc.).
   * @type {string}
   * @memberof UpdateDatabaseRequest
   */
  maintenanceTime?: string;
  /**
   * The preferred hour of the day (UTC) for daily backups to take place (unavailable for Kafka engine types).
   * @type {string}
   * @memberof UpdateDatabaseRequest
   */
  backupHour?: string;
  /**
   * The preferred minute of the backup hour for daily backups to take place (unavailable for Kafka engine types).
   * @type {string}
   * @memberof UpdateDatabaseRequest
   */
  backupMinute?: string;
  /**
   * The configured time zone for the Managed Database in TZ database format (e.g. `UTC`, `America/New_York`, `Europe/London`, etc.).
   * @type {string}
   * @memberof UpdateDatabaseRequest
   */
  clusterTimeZone?: string;
  /**
   * A list of IP addresses allowed to access the Managed Database in CIDR notation (defaults to /32 if excluded).
   * @type {Array<string>}
   * @memberof UpdateDatabaseRequest
   */
  trustedIps?: Array<string>;
  /**
   * A list of SQL modes to enable on the Managed Database (MySQL engine types only).
   * * `ALLOW_INVALID_DATES`
   * * `ANSI` (Combination Mode)
   * * `ANSI_QUOTES`
   * * `ERROR_FOR_DIVISION_BY_ZERO`
   * * `HIGH_NOT_PRECEDENCE`
   * * `IGNORE_SPACE`
   * * `NO_AUTO_VALUE_ON_ZERO`
   * * `NO_DIR_IN_CREATE`
   * * `NO_ENGINE_SUBSTITUTION`
   * * `NO_UNSIGNED_SUBTRACTION`
   * * `NO_ZERO_DATE`
   * * `NO_ZERO_IN_DATE`
   * * `ONLY_FULL_GROUP_BY`
   * * `PIPES_AS_CONCAT`
   * * `REAL_AS_FLOAT`
   * * `STRICT_ALL_TABLES`
   * * `STRICT_TRANS_TABLES`
   * * `TIME_TRUNCATE_FRACTIONAL`
   * * `TRADITIONAL` (Combination Mode)
   * @type {Array<string>}
   * @memberof UpdateDatabaseRequest
   */
  mysqlSqlModes?: Array<string>;
  /**
   * Require a primary key for all tables on the Managed Database (MySQL engine types only).
   * @type {boolean}
   * @memberof UpdateDatabaseRequest
   */
  mysqlRequirePrimaryKey?: boolean;
  /**
   * Enable or disable slow query logging on the Managed Database (MySQL engine types only).
   * @type {boolean}
   * @memberof UpdateDatabaseRequest
   */
  mysqlSlowQueryLog?: boolean;
  /**
   * The number of seconds to denote a slow query when logging is enabled (MySQL engine types only).
   * @type {number}
   * @memberof UpdateDatabaseRequest
   */
  mysqlLongQueryTime?: number;
  /**
   * Set the data eviction policy for the Managed Database (Redis engine types only)
   * @type {string}
   * @memberof UpdateDatabaseRequest
   * @deprecated
   */
  redisEvictionPolicy?: string;
  /**
   * Set the data eviction policy for the Managed Database (Valkey engine types only)
   * @type {string}
   * @memberof UpdateDatabaseRequest
   */
  evictionPolicy?: string;
  /**
   * Enable or disable Kafka REST support on the Managed Database (Kafka engine types only on business plans or higher).
   * @type {boolean}
   * @memberof UpdateDatabaseRequest
   */
  enableKafkaRest?: boolean;
  /**
   * Enable or disable Schema Registry support on the Managed Database (Kafka engine types only on business plans or higher).
   * @type {boolean}
   * @memberof UpdateDatabaseRequest
   */
  enableSchemaRegistry?: boolean;
  /**
   * Enable or disable Kafka Connect support on the Managed Database (Kafka engine types only on business plans or higher).
   * @type {boolean}
   * @memberof UpdateDatabaseRequest
   */
  enableKafkaConnect?: boolean;
}

/**
 * Check if a given object implements the UpdateDatabaseRequest interface.
 */
export function instanceOfUpdateDatabaseRequest(value: object): value is UpdateDatabaseRequest {
  return true;
}

export function UpdateDatabaseRequestFromJSON(json: any): UpdateDatabaseRequest {
  return UpdateDatabaseRequestFromJSONTyped(json, false);
}

export function UpdateDatabaseRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): UpdateDatabaseRequest {
  if (json == null) {
    return json;
  }
  return {
    region: json['region'] == null ? undefined : json['region'],
    plan: json['plan'] == null ? undefined : json['plan'],
    label: json['label'] == null ? undefined : json['label'],
    tag: json['tag'] == null ? undefined : json['tag'],
    vpcId: json['vpc_id'] == null ? undefined : json['vpc_id'],
    maintenanceDow: json['maintenance_dow'] == null ? undefined : json['maintenance_dow'],
    maintenanceTime: json['maintenance_time'] == null ? undefined : json['maintenance_time'],
    backupHour: json['backup_hour'] == null ? undefined : json['backup_hour'],
    backupMinute: json['backup_minute'] == null ? undefined : json['backup_minute'],
    clusterTimeZone: json['cluster_time_zone'] == null ? undefined : json['cluster_time_zone'],
    trustedIps: json['trusted_ips'] == null ? undefined : json['trusted_ips'],
    mysqlSqlModes: json['mysql_sql_modes'] == null ? undefined : json['mysql_sql_modes'],
    mysqlRequirePrimaryKey: json['mysql_require_primary_key'] == null ? undefined : json['mysql_require_primary_key'],
    mysqlSlowQueryLog: json['mysql_slow_query_log'] == null ? undefined : json['mysql_slow_query_log'],
    mysqlLongQueryTime: json['mysql_long_query_time'] == null ? undefined : json['mysql_long_query_time'],
    redisEvictionPolicy: json['redis_eviction_policy'] == null ? undefined : json['redis_eviction_policy'],
    evictionPolicy: json['eviction_policy'] == null ? undefined : json['eviction_policy'],
    enableKafkaRest: json['enable_kafka_rest'] == null ? undefined : json['enable_kafka_rest'],
    enableSchemaRegistry: json['enable_schema_registry'] == null ? undefined : json['enable_schema_registry'],
    enableKafkaConnect: json['enable_kafka_connect'] == null ? undefined : json['enable_kafka_connect'],
  };
}

export function UpdateDatabaseRequestToJSON(json: any): UpdateDatabaseRequest {
  return UpdateDatabaseRequestToJSONTyped(json, false);
}

export function UpdateDatabaseRequestToJSONTyped(value?: UpdateDatabaseRequest | null, ignoreDiscriminator: boolean = false): any {
  if (value == null) {
    return value;
  }

  return {
    region: value['region'],
    plan: value['plan'],
    label: value['label'],
    tag: value['tag'],
    vpc_id: value['vpcId'],
    maintenance_dow: value['maintenanceDow'],
    maintenance_time: value['maintenanceTime'],
    backup_hour: value['backupHour'],
    backup_minute: value['backupMinute'],
    cluster_time_zone: value['clusterTimeZone'],
    trusted_ips: value['trustedIps'],
    mysql_sql_modes: value['mysqlSqlModes'],
    mysql_require_primary_key: value['mysqlRequirePrimaryKey'],
    mysql_slow_query_log: value['mysqlSlowQueryLog'],
    mysql_long_query_time: value['mysqlLongQueryTime'],
    redis_eviction_policy: value['redisEvictionPolicy'],
    eviction_policy: value['evictionPolicy'],
    enable_kafka_rest: value['enableKafkaRest'],
    enable_schema_registry: value['enableSchemaRegistry'],
    enable_kafka_connect: value['enableKafkaConnect'],
  };
}
