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
 * Managed Database information.
 * @export
 * @interface Database
 */
export interface Database {
  /**
   * A unique ID for the Managed Database.
   * @type {string}
   * @memberof Database
   */
  id?: string;
  /**
   * The date this database was created.
   * @type {string}
   * @memberof Database
   */
  dateCreated?: string;
  /**
   * The name of the Managed Database plan.
   * @type {string}
   * @memberof Database
   */
  plan?: string;
  /**
   * The size of the disk in GB (excluded for Valkey engine types).
   * @type {number}
   * @memberof Database
   */
  planDisk?: number;
  /**
   * The amount of RAM in MB.
   * @type {number}
   * @memberof Database
   */
  planRam?: number;
  /**
   * Number of vCPUs.
   * @type {number}
   * @memberof Database
   */
  planVcpus?: number;
  /**
   * Number of replica nodes (excluded for Kafka engine types).
   * @type {number}
   * @memberof Database
   */
  planReplicas?: number;
  /**
   * Number of brokers (Kafka engine types only).
   * @type {number}
   * @memberof Database
   */
  planBrokers?: number;
  /**
   * The [Region id](#operation/list-regions) where the Managed Database is located.
   * @type {string}
   * @memberof Database
   */
  region?: string;
  /**
   * The database engine type (MySQL, PostgreSQL, Valkey, Kafka).
   * @type {string}
   * @memberof Database
   */
  databaseEngine?: string;
  /**
   * The version number of the database engine in use.
   * @type {string}
   * @memberof Database
   */
  databaseEngineVersion?: string;
  /**
   * The ID of the [VPC Network](#operation/get-vpc) attached to the Managed Database.
   * @type {string}
   * @memberof Database
   */
  vpcId?: string;
  /**
   * The current status.
   *
   * * Rebuilding
   * * Rebalancing
   * * Running
   * @type {string}
   * @memberof Database
   */
  status?: string;
  /**
   * The user-supplied label for this managed database.
   * @type {string}
   * @memberof Database
   */
  label?: string;
  /**
   * The user-supplied tag for this managed database.
   * @type {string}
   * @memberof Database
   */
  tag?: string;
  /**
   * The default database name.
   * @type {string}
   * @memberof Database
   */
  dbname?: string;
  /**
   * The public hostname for database connections, or private hostname if this managed database is attached to a VPC network.
   * @type {string}
   * @memberof Database
   */
  host?: string;
  /**
   * The public hostname for database connections. Only visible when the managed database is attached to a VPC network.
   * @type {string}
   * @memberof Database
   */
  publicHost?: string;
  /**
   * The default user configured on creation.
   * @type {string}
   * @memberof Database
   */
  user?: string;
  /**
   * The default user's secure password generated on creation.
   * @type {string}
   * @memberof Database
   */
  password?: string;
  /**
   * The private key to authenticate the default user (Kafka engine types only).
   * @type {string}
   * @memberof Database
   */
  accessKey?: string;
  /**
   * The certificate to authenticate the default user (Kafka engine types only).
   * @type {string}
   * @memberof Database
   */
  accessCert?: string;
  /**
   * The assigned port for connecting to the Managed Database.
   * @type {string}
   * @memberof Database
   */
  port?: string;
  /**
   * The port for connecting to the Managed Database via SASL (Kafka engine types only).
   * @type {string}
   * @memberof Database
   */
  saslPort?: string;
  /**
   * Configuration value for Kafka REST support on the Managed Database (Kafka engine types only on business plans or higher).
   * @type {boolean}
   * @memberof Database
   */
  enableKafkaRest?: boolean;
  /**
   * The URI to access the RESTful interface of your Kafka cluster if Kafka REST is enabled. For more information on how to interact with your cluster's RESTful interface, please refer to the [Confluent REST Proxy API v2 documentation](https://docs.confluent.io/platform/current/kafka-rest/api.html#rest-proxy-v2).
   * @type {boolean}
   * @memberof Database
   */
  kafkaRestUri?: boolean;
  /**
   * Configuration value for Schema Registry support on the Managed Database (Kafka engine types only on business plans or higher).
   * @type {boolean}
   * @memberof Database
   */
  enableSchemaRegistry?: boolean;
  /**
   * The URI to access the Schema Registry service of your Kafka cluster if Schema Registry is enabled. For more information on how to interact with your cluster's Schema Registry, please refer to the [Confluent Schema Registry API Reference](https://docs.confluent.io/platform/current/schema-registry/develop/api.html).
   * @type {boolean}
   * @memberof Database
   */
  schemaRegistryUri?: boolean;
  /**
   * Configuration value for Kafka Connect support on the Managed Database (Kafka engine types only on business plans or higher).
   * @type {boolean}
   * @memberof Database
   */
  enableKafkaConnect?: boolean;
  /**
   * The chosen date of week for routine maintenance updates.
   * @type {string}
   * @memberof Database
   */
  maintenanceDow?: string;
  /**
   * The chosen hour for routine maintenance updates.
   * @type {string}
   * @memberof Database
   */
  maintenanceTime?: string;
  /**
   * The chosen hour for daily backups to take place. Excluded for Kafka engine types.
   * @type {string}
   * @memberof Database
   */
  backupHour?: string;
  /**
   * The chosen minute of the backup hour for daily backups to take place. Excluded for Kafka engine types.
   * @type {string}
   * @memberof Database
   */
  backupMinute?: string;
  /**
   * The date for the latest backup stored on the Managed Database.
   * @type {string}
   * @memberof Database
   */
  latestBackup?: string;
  /**
   * A list of trusted IP addresses for connecting to this Managed Database (in CIDR notation).
   * @type {Array<string>}
   * @memberof Database
   */
  trustedIps?: Array<string>;
  /**
   * The CA certificate for Managed Databases on this account.
   * @type {string}
   * @memberof Database
   */
  caCertificate?: string;
  /**
   * A list names of enabled SQL Modes (MySQL engine types only).
   * @type {Array<string>}
   * @memberof Database
   */
  mysqlSqlModes?: Array<string>;
  /**
   * Configuration value for requiring table primary keys (MySQL engine types only).
   * @type {boolean}
   * @memberof Database
   */
  mysqlRequirePrimaryKey?: boolean;
  /**
   * Configuration value for slow query logging on the Managed Database (MySQL engine types only).
   * @type {boolean}
   * @memberof Database
   */
  mysqlSlowQueryLog?: boolean;
  /**
   * The number of seconds to denote a slow query when logging is enabled (MySQL engine types only).
   * @type {number}
   * @memberof Database
   */
  mysqlLongQueryTime?: number;
  /**
   * A list of objects containing names and versions (when applicable) of available extensions for PostgreSQL engine types only.
   * @type {Array<object>}
   * @memberof Database
   */
  pgAvailableExtensions?: Array<object>;
  /**
   * The current configured data eviction policy for Redis engine types only.
   * @type {string}
   * @memberof Database
   * @deprecated
   */
  redisEvictionPolicy?: string;
  /**
   * The current configured data eviction policy for Valkey engine types only.
   * @type {string}
   * @memberof Database
   */
  evictionPolicy?: string;
  /**
   * The configured time zone of the Managed Database in TZ database format.
   * @type {string}
   * @memberof Database
   */
  clusterTimeZone?: string;
  /**
   * A list of database objects containing details for all attached read-only replica nodes.
   * @type {Array<object>}
   * @memberof Database
   */
  readReplicas?: Array<object>;
}

/**
 * Check if a given object implements the Database interface.
 */
export function instanceOfDatabase(value: object): value is Database {
  return true;
}

export function DatabaseFromJSON(json: any): Database {
  return DatabaseFromJSONTyped(json, false);
}

export function DatabaseFromJSONTyped(json: any, ignoreDiscriminator: boolean): Database {
  if (json == null) {
    return json;
  }
  return {
    id: json['id'] == null ? undefined : json['id'],
    dateCreated: json['date_created'] == null ? undefined : json['date_created'],
    plan: json['plan'] == null ? undefined : json['plan'],
    planDisk: json['plan_disk'] == null ? undefined : json['plan_disk'],
    planRam: json['plan_ram'] == null ? undefined : json['plan_ram'],
    planVcpus: json['plan_vcpus'] == null ? undefined : json['plan_vcpus'],
    planReplicas: json['plan_replicas'] == null ? undefined : json['plan_replicas'],
    planBrokers: json['plan_brokers'] == null ? undefined : json['plan_brokers'],
    region: json['region'] == null ? undefined : json['region'],
    databaseEngine: json['database_engine'] == null ? undefined : json['database_engine'],
    databaseEngineVersion: json['database_engine_version'] == null ? undefined : json['database_engine_version'],
    vpcId: json['vpc_id'] == null ? undefined : json['vpc_id'],
    status: json['status'] == null ? undefined : json['status'],
    label: json['label'] == null ? undefined : json['label'],
    tag: json['tag'] == null ? undefined : json['tag'],
    dbname: json['dbname'] == null ? undefined : json['dbname'],
    host: json['host'] == null ? undefined : json['host'],
    publicHost: json['public_host'] == null ? undefined : json['public_host'],
    user: json['user'] == null ? undefined : json['user'],
    password: json['password'] == null ? undefined : json['password'],
    accessKey: json['access_key'] == null ? undefined : json['access_key'],
    accessCert: json['access_cert'] == null ? undefined : json['access_cert'],
    port: json['port'] == null ? undefined : json['port'],
    saslPort: json['sasl_port'] == null ? undefined : json['sasl_port'],
    enableKafkaRest: json['enable_kafka_rest'] == null ? undefined : json['enable_kafka_rest'],
    kafkaRestUri: json['kafka_rest_uri'] == null ? undefined : json['kafka_rest_uri'],
    enableSchemaRegistry: json['enable_schema_registry'] == null ? undefined : json['enable_schema_registry'],
    schemaRegistryUri: json['schema_registry_uri'] == null ? undefined : json['schema_registry_uri'],
    enableKafkaConnect: json['enable_kafka_connect'] == null ? undefined : json['enable_kafka_connect'],
    maintenanceDow: json['maintenance_dow'] == null ? undefined : json['maintenance_dow'],
    maintenanceTime: json['maintenance_time'] == null ? undefined : json['maintenance_time'],
    backupHour: json['backup_hour'] == null ? undefined : json['backup_hour'],
    backupMinute: json['backup_minute'] == null ? undefined : json['backup_minute'],
    latestBackup: json['latest_backup'] == null ? undefined : json['latest_backup'],
    trustedIps: json['trusted_ips'] == null ? undefined : json['trusted_ips'],
    caCertificate: json['ca_certificate'] == null ? undefined : json['ca_certificate'],
    mysqlSqlModes: json['mysql_sql_modes'] == null ? undefined : json['mysql_sql_modes'],
    mysqlRequirePrimaryKey: json['mysql_require_primary_key'] == null ? undefined : json['mysql_require_primary_key'],
    mysqlSlowQueryLog: json['mysql_slow_query_log'] == null ? undefined : json['mysql_slow_query_log'],
    mysqlLongQueryTime: json['mysql_long_query_time'] == null ? undefined : json['mysql_long_query_time'],
    pgAvailableExtensions: json['pg_available_extensions'] == null ? undefined : json['pg_available_extensions'],
    redisEvictionPolicy: json['redis_eviction_policy'] == null ? undefined : json['redis_eviction_policy'],
    evictionPolicy: json['eviction_policy'] == null ? undefined : json['eviction_policy'],
    clusterTimeZone: json['cluster_time_zone'] == null ? undefined : json['cluster_time_zone'],
    readReplicas: json['read_replicas'] == null ? undefined : json['read_replicas'],
  };
}

export function DatabaseToJSON(json: any): Database {
  return DatabaseToJSONTyped(json, false);
}

export function DatabaseToJSONTyped(value?: Database | null, ignoreDiscriminator: boolean = false): any {
  if (value == null) {
    return value;
  }

  return {
    id: value['id'],
    date_created: value['dateCreated'],
    plan: value['plan'],
    plan_disk: value['planDisk'],
    plan_ram: value['planRam'],
    plan_vcpus: value['planVcpus'],
    plan_replicas: value['planReplicas'],
    plan_brokers: value['planBrokers'],
    region: value['region'],
    database_engine: value['databaseEngine'],
    database_engine_version: value['databaseEngineVersion'],
    vpc_id: value['vpcId'],
    status: value['status'],
    label: value['label'],
    tag: value['tag'],
    dbname: value['dbname'],
    host: value['host'],
    public_host: value['publicHost'],
    user: value['user'],
    password: value['password'],
    access_key: value['accessKey'],
    access_cert: value['accessCert'],
    port: value['port'],
    sasl_port: value['saslPort'],
    enable_kafka_rest: value['enableKafkaRest'],
    kafka_rest_uri: value['kafkaRestUri'],
    enable_schema_registry: value['enableSchemaRegistry'],
    schema_registry_uri: value['schemaRegistryUri'],
    enable_kafka_connect: value['enableKafkaConnect'],
    maintenance_dow: value['maintenanceDow'],
    maintenance_time: value['maintenanceTime'],
    backup_hour: value['backupHour'],
    backup_minute: value['backupMinute'],
    latest_backup: value['latestBackup'],
    trusted_ips: value['trustedIps'],
    ca_certificate: value['caCertificate'],
    mysql_sql_modes: value['mysqlSqlModes'],
    mysql_require_primary_key: value['mysqlRequirePrimaryKey'],
    mysql_slow_query_log: value['mysqlSlowQueryLog'],
    mysql_long_query_time: value['mysqlLongQueryTime'],
    pg_available_extensions: value['pgAvailableExtensions'],
    redis_eviction_policy: value['redisEvictionPolicy'],
    eviction_policy: value['evictionPolicy'],
    cluster_time_zone: value['clusterTimeZone'],
    read_replicas: value['readReplicas'],
  };
}
