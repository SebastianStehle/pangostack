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
 * @interface CreateDatabaseRequest
 */
export interface CreateDatabaseRequest {
  /**
   * The database engine type for the Managed Database.
   * * `mysql`
   * * `pg`
   * * `valkey`
   * * `kafka`
   * @type {string}
   * @memberof CreateDatabaseRequest
   */
  databaseEngine: string;
  /**
   * The version of the chosen database engine type for the Managed Database.
   * * MySQL: `8`
   * * PostgreSQL: `13` - `17`
   * * Valkey: `7`
   * * Kafka: `3.8`
   * @type {string}
   * @memberof CreateDatabaseRequest
   */
  databaseEngineVersion: string;
  /**
   * The [Region id](#operation/list-regions) where the Managed Database is located.
   * @type {string}
   * @memberof CreateDatabaseRequest
   */
  region: string;
  /**
   * The [Plan id](#operation/list-database-plans) to use when deploying this Managed Database.
   * @type {string}
   * @memberof CreateDatabaseRequest
   */
  plan: string;
  /**
   * A user-supplied label for this Managed Database.
   * @type {string}
   * @memberof CreateDatabaseRequest
   */
  label: string;
  /**
   * The user-supplied tag for this Managed Database.
   * @type {string}
   * @memberof CreateDatabaseRequest
   */
  tag?: string;
  /**
   * The [VPC id](#operation/list-vpcs) to use when deploying this Managed Database. It can also be set to `new` to configure a new VPC network with this deployment.
   * @type {string}
   * @memberof CreateDatabaseRequest
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
   * @memberof CreateDatabaseRequest
   */
  maintenanceDow?: string;
  /**
   * The preferred time (UTC) for routine maintenance updates to occur in 24-hour HH:00 format (e.g. `01:00`, `13:00`, `23:00`, etc.).
   * @type {string}
   * @memberof CreateDatabaseRequest
   */
  maintenanceTime?: string;
  /**
   * The preferred hour of the day (UTC) for daily backups to take place (unavailable for Kafka engine types).
   * @type {string}
   * @memberof CreateDatabaseRequest
   */
  backupHour?: string;
  /**
   * The preferred minute of the backup hour for daily backups to take place (unavailable for Kafka engine types).
   * @type {string}
   * @memberof CreateDatabaseRequest
   */
  backupMinute?: string;
  /**
   * A list of IP addresses allowed to access the Managed Database in CIDR notation (defaults to /32 if excluded).
   * @type {Array<string>}
   * @memberof CreateDatabaseRequest
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
   * @memberof CreateDatabaseRequest
   */
  mysqlSqlModes?: Array<string>;
  /**
   * Require a primary key for all tables on the Managed Database (MySQL engine types only).
   * @type {boolean}
   * @memberof CreateDatabaseRequest
   */
  mysqlRequirePrimaryKey?: boolean;
  /**
   * Enable or disable slow query logging on the Managed Database (MySQL engine types only).
   * @type {boolean}
   * @memberof CreateDatabaseRequest
   */
  mysqlSlowQueryLog?: boolean;
  /**
   * The number of seconds to denote a slow query when logging is enabled (MySQL engine types only).
   * @type {number}
   * @memberof CreateDatabaseRequest
   */
  mysqlLongQueryTime?: number;
  /**
   * Set the data eviction policy for the Managed Database (Redis engine types only)
   * @type {string}
   * @memberof CreateDatabaseRequest
   * @deprecated
   */
  redisEvictionPolicy?: string;
  /**
   * Set the data eviction policy for the Managed Database (Valkey engine types only)
   * @type {string}
   * @memberof CreateDatabaseRequest
   */
  evictionPolicy?: string;
  /**
   * Enable or disable Kafka REST support on the Managed Database (Kafka engine types only on business plans or higher).
   * @type {boolean}
   * @memberof CreateDatabaseRequest
   */
  enableKafkaRest?: boolean;
  /**
   * Enable or disable Schema Registry support on the Managed Database (Kafka engine types only on business plans or higher).
   * @type {boolean}
   * @memberof CreateDatabaseRequest
   */
  enableSchemaRegistry?: boolean;
  /**
   * Enable or disable Kafka Connect support on the Managed Database (Kafka engine types only on business plans or higher).
   * @type {boolean}
   * @memberof CreateDatabaseRequest
   */
  enableKafkaConnect?: boolean;
}

/**
 * Check if a given object implements the CreateDatabaseRequest interface.
 */
export function instanceOfCreateDatabaseRequest(value: object): value is CreateDatabaseRequest {
  if (!('databaseEngine' in value) || value['databaseEngine'] === undefined) return false;
  if (!('databaseEngineVersion' in value) || value['databaseEngineVersion'] === undefined) return false;
  if (!('region' in value) || value['region'] === undefined) return false;
  if (!('plan' in value) || value['plan'] === undefined) return false;
  if (!('label' in value) || value['label'] === undefined) return false;
  return true;
}

export function CreateDatabaseRequestFromJSON(json: any): CreateDatabaseRequest {
  return CreateDatabaseRequestFromJSONTyped(json, false);
}

export function CreateDatabaseRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateDatabaseRequest {
  if (json == null) {
    return json;
  }
  return {
    databaseEngine: json['database_engine'],
    databaseEngineVersion: json['database_engine_version'],
    region: json['region'],
    plan: json['plan'],
    label: json['label'],
    tag: json['tag'] == null ? undefined : json['tag'],
    vpcId: json['vpc_id'] == null ? undefined : json['vpc_id'],
    maintenanceDow: json['maintenance_dow'] == null ? undefined : json['maintenance_dow'],
    maintenanceTime: json['maintenance_time'] == null ? undefined : json['maintenance_time'],
    backupHour: json['backup_hour'] == null ? undefined : json['backup_hour'],
    backupMinute: json['backup_minute'] == null ? undefined : json['backup_minute'],
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

export function CreateDatabaseRequestToJSON(json: any): CreateDatabaseRequest {
  return CreateDatabaseRequestToJSONTyped(json, false);
}

export function CreateDatabaseRequestToJSONTyped(value?: CreateDatabaseRequest | null, ignoreDiscriminator: boolean = false): any {
  if (value == null) {
    return value;
  }

  return {
    database_engine: value['databaseEngine'],
    database_engine_version: value['databaseEngineVersion'],
    region: value['region'],
    plan: value['plan'],
    label: value['label'],
    tag: value['tag'],
    vpc_id: value['vpcId'],
    maintenance_dow: value['maintenanceDow'],
    maintenance_time: value['maintenanceTime'],
    backup_hour: value['backupHour'],
    backup_minute: value['backupMinute'],
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
