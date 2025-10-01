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

import * as runtime from '../runtime';
import type {
  CreateConnectionPool201Response,
  CreateConnectionPoolRequest,
  CreateDatabase201Response,
  CreateDatabaseConnector201Response,
  CreateDatabaseConnectorRequest,
  CreateDatabaseDb201Response,
  CreateDatabaseDbRequest,
  CreateDatabaseQuota201Response,
  CreateDatabaseQuotaRequest,
  CreateDatabaseRequest,
  CreateDatabaseTopic201Response,
  CreateDatabaseTopicRequest,
  CreateDatabaseUser201Response,
  CreateDatabaseUserRequest,
  DatabaseAddReadReplicaRequest,
  DatabaseForkRequest,
  DatabaseRestoreFromBackupRequest,
  DatabaseStartMigrationRequest,
  GetBackupInformation200Response,
  GetDatabaseConnectorConfigurationSchema200Response,
  GetDatabaseConnectorStatus200Response,
  GetDatabaseUsage200Response,
  KafkaConnectAdvancedOptions,
  KafkaRestAdvancedOptions,
  ListAdvancedOptions200Response,
  ListAvailableVersions200Response,
  ListConnectionPools200Response,
  ListDatabaseAvailableConnectors200Response,
  ListDatabaseConnectors200Response,
  ListDatabaseDbs200Response,
  ListDatabasePlans200Response,
  ListDatabaseQuotas200Response,
  ListDatabaseTopics200Response,
  ListDatabaseUsers200Response,
  ListDatabases200Response,
  ListMaintenanceUpdates200Response,
  ListServiceAlerts200Response,
  ListServiceAlertsRequest,
  SchemaRegistryAdvancedOptions,
  SetDatabaseUserAclRequest,
  StartMaintenanceUpdates200Response,
  StartVersionUpgrade200Response,
  StartVersionUpgradeRequest,
  UpdateAdvancedOptionsRequest,
  UpdateConnectionPoolRequest,
  UpdateDatabaseConnectorRequest,
  UpdateDatabaseQuotaRequest,
  UpdateDatabaseRequest,
  UpdateDatabaseTopicRequest,
  UpdateDatabaseUserRequest,
  ViewMigrationStatus200Response,
} from '../models/index';
import {
  CreateConnectionPool201ResponseFromJSON,
  CreateConnectionPool201ResponseToJSON,
  CreateConnectionPoolRequestFromJSON,
  CreateConnectionPoolRequestToJSON,
  CreateDatabase201ResponseFromJSON,
  CreateDatabase201ResponseToJSON,
  CreateDatabaseConnector201ResponseFromJSON,
  CreateDatabaseConnector201ResponseToJSON,
  CreateDatabaseConnectorRequestFromJSON,
  CreateDatabaseConnectorRequestToJSON,
  CreateDatabaseDb201ResponseFromJSON,
  CreateDatabaseDb201ResponseToJSON,
  CreateDatabaseDbRequestFromJSON,
  CreateDatabaseDbRequestToJSON,
  CreateDatabaseQuota201ResponseFromJSON,
  CreateDatabaseQuota201ResponseToJSON,
  CreateDatabaseQuotaRequestFromJSON,
  CreateDatabaseQuotaRequestToJSON,
  CreateDatabaseRequestFromJSON,
  CreateDatabaseRequestToJSON,
  CreateDatabaseTopic201ResponseFromJSON,
  CreateDatabaseTopic201ResponseToJSON,
  CreateDatabaseTopicRequestFromJSON,
  CreateDatabaseTopicRequestToJSON,
  CreateDatabaseUser201ResponseFromJSON,
  CreateDatabaseUser201ResponseToJSON,
  CreateDatabaseUserRequestFromJSON,
  CreateDatabaseUserRequestToJSON,
  DatabaseAddReadReplicaRequestFromJSON,
  DatabaseAddReadReplicaRequestToJSON,
  DatabaseForkRequestFromJSON,
  DatabaseForkRequestToJSON,
  DatabaseRestoreFromBackupRequestFromJSON,
  DatabaseRestoreFromBackupRequestToJSON,
  DatabaseStartMigrationRequestFromJSON,
  DatabaseStartMigrationRequestToJSON,
  GetBackupInformation200ResponseFromJSON,
  GetBackupInformation200ResponseToJSON,
  GetDatabaseConnectorConfigurationSchema200ResponseFromJSON,
  GetDatabaseConnectorConfigurationSchema200ResponseToJSON,
  GetDatabaseConnectorStatus200ResponseFromJSON,
  GetDatabaseConnectorStatus200ResponseToJSON,
  GetDatabaseUsage200ResponseFromJSON,
  GetDatabaseUsage200ResponseToJSON,
  KafkaConnectAdvancedOptionsFromJSON,
  KafkaConnectAdvancedOptionsToJSON,
  KafkaRestAdvancedOptionsFromJSON,
  KafkaRestAdvancedOptionsToJSON,
  ListAdvancedOptions200ResponseFromJSON,
  ListAdvancedOptions200ResponseToJSON,
  ListAvailableVersions200ResponseFromJSON,
  ListAvailableVersions200ResponseToJSON,
  ListConnectionPools200ResponseFromJSON,
  ListConnectionPools200ResponseToJSON,
  ListDatabaseAvailableConnectors200ResponseFromJSON,
  ListDatabaseAvailableConnectors200ResponseToJSON,
  ListDatabaseConnectors200ResponseFromJSON,
  ListDatabaseConnectors200ResponseToJSON,
  ListDatabaseDbs200ResponseFromJSON,
  ListDatabaseDbs200ResponseToJSON,
  ListDatabasePlans200ResponseFromJSON,
  ListDatabasePlans200ResponseToJSON,
  ListDatabaseQuotas200ResponseFromJSON,
  ListDatabaseQuotas200ResponseToJSON,
  ListDatabaseTopics200ResponseFromJSON,
  ListDatabaseTopics200ResponseToJSON,
  ListDatabaseUsers200ResponseFromJSON,
  ListDatabaseUsers200ResponseToJSON,
  ListDatabases200ResponseFromJSON,
  ListDatabases200ResponseToJSON,
  ListMaintenanceUpdates200ResponseFromJSON,
  ListMaintenanceUpdates200ResponseToJSON,
  ListServiceAlerts200ResponseFromJSON,
  ListServiceAlerts200ResponseToJSON,
  ListServiceAlertsRequestFromJSON,
  ListServiceAlertsRequestToJSON,
  SchemaRegistryAdvancedOptionsFromJSON,
  SchemaRegistryAdvancedOptionsToJSON,
  SetDatabaseUserAclRequestFromJSON,
  SetDatabaseUserAclRequestToJSON,
  StartMaintenanceUpdates200ResponseFromJSON,
  StartMaintenanceUpdates200ResponseToJSON,
  StartVersionUpgrade200ResponseFromJSON,
  StartVersionUpgrade200ResponseToJSON,
  StartVersionUpgradeRequestFromJSON,
  StartVersionUpgradeRequestToJSON,
  UpdateAdvancedOptionsRequestFromJSON,
  UpdateAdvancedOptionsRequestToJSON,
  UpdateConnectionPoolRequestFromJSON,
  UpdateConnectionPoolRequestToJSON,
  UpdateDatabaseConnectorRequestFromJSON,
  UpdateDatabaseConnectorRequestToJSON,
  UpdateDatabaseQuotaRequestFromJSON,
  UpdateDatabaseQuotaRequestToJSON,
  UpdateDatabaseRequestFromJSON,
  UpdateDatabaseRequestToJSON,
  UpdateDatabaseTopicRequestFromJSON,
  UpdateDatabaseTopicRequestToJSON,
  UpdateDatabaseUserRequestFromJSON,
  UpdateDatabaseUserRequestToJSON,
  ViewMigrationStatus200ResponseFromJSON,
  ViewMigrationStatus200ResponseToJSON,
} from '../models/index';

export interface CreateConnectionPoolOperationRequest {
  databaseId: string;
  createConnectionPoolRequest?: CreateConnectionPoolRequest;
}

export interface CreateDatabaseOperationRequest {
  createDatabaseRequest?: CreateDatabaseRequest;
}

export interface CreateDatabaseConnectorOperationRequest {
  databaseId: string;
  createDatabaseConnectorRequest?: CreateDatabaseConnectorRequest;
}

export interface CreateDatabaseDbOperationRequest {
  databaseId: string;
  createDatabaseDbRequest?: CreateDatabaseDbRequest;
}

export interface CreateDatabaseQuotaOperationRequest {
  databaseId: string;
  createDatabaseQuotaRequest?: CreateDatabaseQuotaRequest;
}

export interface CreateDatabaseTopicOperationRequest {
  databaseId: string;
  createDatabaseTopicRequest?: CreateDatabaseTopicRequest;
}

export interface CreateDatabaseUserOperationRequest {
  databaseId: string;
  createDatabaseUserRequest?: CreateDatabaseUserRequest;
}

export interface DatabaseAddReadReplicaOperationRequest {
  databaseId: string;
  databaseAddReadReplicaRequest?: DatabaseAddReadReplicaRequest;
}

export interface DatabaseDetachMigrationRequest {
  databaseId: string;
}

export interface DatabaseForkOperationRequest {
  databaseId: string;
  databaseForkRequest?: DatabaseForkRequest;
}

export interface DatabasePromoteReadReplicaRequest {
  databaseId: string;
}

export interface DatabaseRestoreFromBackupOperationRequest {
  databaseId: string;
  databaseRestoreFromBackupRequest?: DatabaseRestoreFromBackupRequest;
}

export interface DatabaseStartMigrationOperationRequest {
  databaseId: string;
  databaseStartMigrationRequest?: DatabaseStartMigrationRequest;
}

export interface DeleteConnectionPoolRequest {
  databaseId: string;
  poolName: string;
}

export interface DeleteDatabaseRequest {
  databaseId: string;
}

export interface DeleteDatabaseConnectorRequest {
  databaseId: string;
  connectorName: string;
}

export interface DeleteDatabaseDbRequest {
  databaseId: string;
  dbName: string;
}

export interface DeleteDatabaseQuotaRequest {
  databaseId: string;
  clientId: string;
  username: string;
}

export interface DeleteDatabaseTopicRequest {
  databaseId: string;
  topicName: string;
}

export interface DeleteDatabaseUserRequest {
  databaseId: string;
  username: string;
}

export interface GetBackupInformationRequest {
  databaseId: string;
}

export interface GetConnectionPoolRequest {
  databaseId: string;
  poolName: string;
}

export interface GetDatabaseRequest {
  databaseId: string;
}

export interface GetDatabaseConnectorRequest {
  databaseId: string;
  connectorName: string;
}

export interface GetDatabaseConnectorConfigurationSchemaRequest {
  databaseId: string;
  connectorClass: string;
}

export interface GetDatabaseConnectorStatusRequest {
  databaseId: string;
  connectorName: string;
}

export interface GetDatabaseDbRequest {
  databaseId: string;
  dbName: string;
}

export interface GetDatabaseQuotaRequest {
  databaseId: string;
  clientId: string;
  username: string;
}

export interface GetDatabaseTopicRequest {
  databaseId: string;
  topicName: string;
}

export interface GetDatabaseUsageRequest {
  databaseId: string;
}

export interface GetDatabaseUserRequest {
  databaseId: string;
  username: string;
}

export interface ListAdvancedOptionsRequest {
  databaseId: string;
}

export interface ListAdvancedOptionsKafkaConnectRequest {
  databaseId: string;
}

export interface ListAdvancedOptionsKafkaRestRequest {
  databaseId: string;
}

export interface ListAdvancedOptionsSchemaRegistryRequest {
  databaseId: string;
}

export interface ListAvailableVersionsRequest {
  databaseId: string;
}

export interface ListConnectionPoolsRequest {
  databaseId: string;
}

export interface ListDatabaseAvailableConnectorsRequest {
  databaseId: string;
}

export interface ListDatabaseConnectorsRequest {
  databaseId: string;
}

export interface ListDatabaseDbsRequest {
  databaseId: string;
}

export interface ListDatabasePlansRequest {
  engine?: string;
  nodes?: number;
  region?: string;
}

export interface ListDatabaseQuotasRequest {
  databaseId: string;
}

export interface ListDatabaseTopicsRequest {
  databaseId: string;
}

export interface ListDatabaseUsersRequest {
  databaseId: string;
}

export interface ListDatabasesRequest {
  label?: string;
  tag?: string;
  region?: string;
}

export interface ListMaintenanceUpdatesRequest {
  databaseId: string;
}

export interface ListServiceAlertsOperationRequest {
  databaseId: string;
  listServiceAlertsRequest?: ListServiceAlertsRequest;
}

export interface PauseDatabaseConnectorRequest {
  databaseId: string;
  connectorName: string;
}

export interface RestartDatabaseConnectorRequest {
  databaseId: string;
  connectorName: string;
}

export interface RestartDatabaseConnectorTaskRequest {
  databaseId: string;
  connectorName: string;
  taskId: string;
}

export interface ResumeDatabaseConnectorRequest {
  databaseId: string;
  connectorName: string;
}

export interface SetDatabaseUserAclOperationRequest {
  databaseId: string;
  username: string;
  setDatabaseUserAclRequest?: SetDatabaseUserAclRequest;
}

export interface StartMaintenanceUpdatesRequest {
  databaseId: string;
}

export interface StartVersionUpgradeOperationRequest {
  databaseId: string;
  startVersionUpgradeRequest?: StartVersionUpgradeRequest;
}

export interface UpdateAdvancedOptionsOperationRequest {
  databaseId: string;
  updateAdvancedOptionsRequest?: UpdateAdvancedOptionsRequest;
}

export interface UpdateAdvancedOptionsKafkaConnectRequest {
  databaseId: string;
  kafkaConnectAdvancedOptions?: KafkaConnectAdvancedOptions;
}

export interface UpdateAdvancedOptionsKafkaRestRequest {
  databaseId: string;
  kafkaRestAdvancedOptions?: KafkaRestAdvancedOptions;
}

export interface UpdateAdvancedOptionsSchemaRegistryRequest {
  databaseId: string;
  schemaRegistryAdvancedOptions?: SchemaRegistryAdvancedOptions;
}

export interface UpdateConnectionPoolOperationRequest {
  databaseId: string;
  poolName: string;
  updateConnectionPoolRequest?: UpdateConnectionPoolRequest;
}

export interface UpdateDatabaseOperationRequest {
  databaseId: string;
  updateDatabaseRequest?: UpdateDatabaseRequest;
}

export interface UpdateDatabaseConnectorOperationRequest {
  databaseId: string;
  connectorName: string;
  updateDatabaseConnectorRequest?: UpdateDatabaseConnectorRequest;
}

export interface UpdateDatabaseQuotaOperationRequest {
  databaseId: string;
  clientId: string;
  username: string;
  updateDatabaseQuotaRequest?: UpdateDatabaseQuotaRequest;
}

export interface UpdateDatabaseTopicOperationRequest {
  databaseId: string;
  topicName: string;
  updateDatabaseTopicRequest?: UpdateDatabaseTopicRequest;
}

export interface UpdateDatabaseUserOperationRequest {
  databaseId: string;
  username: string;
  updateDatabaseUserRequest?: UpdateDatabaseUserRequest;
}

export interface ViewMigrationStatusRequest {
  databaseId: string;
}

/**
 *
 */
export class ManagedDatabasesApi extends runtime.BaseAPI {
  /**
   * Create a new connection pool within the Managed Database (PostgreSQL engine types only).
   * Create Connection Pool
   */
  async createConnectionPoolRaw(
    requestParameters: CreateConnectionPoolOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateConnectionPool201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling createConnectionPool().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/connection-pools`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateConnectionPoolRequestToJSON(requestParameters['createConnectionPoolRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateConnectionPool201ResponseFromJSON(jsonValue));
  }

  /**
   * Create a new connection pool within the Managed Database (PostgreSQL engine types only).
   * Create Connection Pool
   */
  async createConnectionPool(
    databaseId: string,
    createConnectionPoolRequest?: CreateConnectionPoolRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateConnectionPool201Response> {
    const response = await this.createConnectionPoolRaw(
      { databaseId: databaseId, createConnectionPoolRequest: createConnectionPoolRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Create a new Managed Database in a `region` with the desired `plan`. Supply optional attributes as desired.
   * Create Managed Database
   */
  async createDatabaseRaw(
    requestParameters: CreateDatabaseOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabase201Response>> {
    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateDatabaseRequestToJSON(requestParameters['createDatabaseRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabase201ResponseFromJSON(jsonValue));
  }

  /**
   * Create a new Managed Database in a `region` with the desired `plan`. Supply optional attributes as desired.
   * Create Managed Database
   */
  async createDatabase(
    createDatabaseRequest?: CreateDatabaseRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDatabase201Response> {
    const response = await this.createDatabaseRaw({ createDatabaseRequest: createDatabaseRequest }, initOverrides);
    return await response.value();
  }

  /**
   * Create a new connector within the Managed Database (Kafka engine types only).
   * Create Database Connector
   */
  async createDatabaseConnectorRaw(
    requestParameters: CreateDatabaseConnectorOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabaseConnector201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling createDatabaseConnector().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/connectors`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateDatabaseConnectorRequestToJSON(requestParameters['createDatabaseConnectorRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabaseConnector201ResponseFromJSON(jsonValue));
  }

  /**
   * Create a new connector within the Managed Database (Kafka engine types only).
   * Create Database Connector
   */
  async createDatabaseConnector(
    databaseId: string,
    createDatabaseConnectorRequest?: CreateDatabaseConnectorRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDatabaseConnector201Response> {
    const response = await this.createDatabaseConnectorRaw(
      { databaseId: databaseId, createDatabaseConnectorRequest: createDatabaseConnectorRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Create a new logical database within the Managed Database (MySQL and PostgreSQL only).
   * Create Logical Database
   */
  async createDatabaseDbRaw(
    requestParameters: CreateDatabaseDbOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabaseDb201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling createDatabaseDb().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/dbs`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateDatabaseDbRequestToJSON(requestParameters['createDatabaseDbRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabaseDb201ResponseFromJSON(jsonValue));
  }

  /**
   * Create a new logical database within the Managed Database (MySQL and PostgreSQL only).
   * Create Logical Database
   */
  async createDatabaseDb(
    databaseId: string,
    createDatabaseDbRequest?: CreateDatabaseDbRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDatabaseDb201Response> {
    const response = await this.createDatabaseDbRaw(
      { databaseId: databaseId, createDatabaseDbRequest: createDatabaseDbRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Create a new quota within the Managed Database (Kafka engine types only).
   * Create Database Quota
   */
  async createDatabaseQuotaRaw(
    requestParameters: CreateDatabaseQuotaOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabaseQuota201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling createDatabaseQuota().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/quotas`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateDatabaseQuotaRequestToJSON(requestParameters['createDatabaseQuotaRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabaseQuota201ResponseFromJSON(jsonValue));
  }

  /**
   * Create a new quota within the Managed Database (Kafka engine types only).
   * Create Database Quota
   */
  async createDatabaseQuota(
    databaseId: string,
    createDatabaseQuotaRequest?: CreateDatabaseQuotaRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDatabaseQuota201Response> {
    const response = await this.createDatabaseQuotaRaw(
      { databaseId: databaseId, createDatabaseQuotaRequest: createDatabaseQuotaRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Create a new topic within the Managed Database (Kafka engine types only).
   * Create Database Topic
   */
  async createDatabaseTopicRaw(
    requestParameters: CreateDatabaseTopicOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabaseTopic201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling createDatabaseTopic().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/topics`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateDatabaseTopicRequestToJSON(requestParameters['createDatabaseTopicRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabaseTopic201ResponseFromJSON(jsonValue));
  }

  /**
   * Create a new topic within the Managed Database (Kafka engine types only).
   * Create Database Topic
   */
  async createDatabaseTopic(
    databaseId: string,
    createDatabaseTopicRequest?: CreateDatabaseTopicRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDatabaseTopic201Response> {
    const response = await this.createDatabaseTopicRaw(
      { databaseId: databaseId, createDatabaseTopicRequest: createDatabaseTopicRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Create a new database user within the Managed Database. Supply optional attributes as desired.
   * Create Database User
   */
  async createDatabaseUserRaw(
    requestParameters: CreateDatabaseUserOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabaseUser201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling createDatabaseUser().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/users`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateDatabaseUserRequestToJSON(requestParameters['createDatabaseUserRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabaseUser201ResponseFromJSON(jsonValue));
  }

  /**
   * Create a new database user within the Managed Database. Supply optional attributes as desired.
   * Create Database User
   */
  async createDatabaseUser(
    databaseId: string,
    createDatabaseUserRequest?: CreateDatabaseUserRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDatabaseUser201Response> {
    const response = await this.createDatabaseUserRaw(
      { databaseId: databaseId, createDatabaseUserRequest: createDatabaseUserRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Create a read-only replica node for the Managed Database.
   * Add Read-Only Replica
   */
  async databaseAddReadReplicaRaw(
    requestParameters: DatabaseAddReadReplicaOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabase201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling databaseAddReadReplica().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/read-replica`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: DatabaseAddReadReplicaRequestToJSON(requestParameters['databaseAddReadReplicaRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabase201ResponseFromJSON(jsonValue));
  }

  /**
   * Create a read-only replica node for the Managed Database.
   * Add Read-Only Replica
   */
  async databaseAddReadReplica(
    databaseId: string,
    databaseAddReadReplicaRequest?: DatabaseAddReadReplicaRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDatabase201Response> {
    const response = await this.databaseAddReadReplicaRaw(
      { databaseId: databaseId, databaseAddReadReplicaRequest: databaseAddReadReplicaRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Detach a migration from the Managed Database.
   * Detach Migration
   */
  async databaseDetachMigrationRaw(
    requestParameters: DatabaseDetachMigrationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling databaseDetachMigration().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/migration`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'DELETE',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Detach a migration from the Managed Database.
   * Detach Migration
   */
  async databaseDetachMigration(databaseId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.databaseDetachMigrationRaw({ databaseId: databaseId }, initOverrides);
  }

  /**
   * Fork a Managed Database to a new subscription from a backup.
   * Fork Managed Database
   */
  async databaseForkRaw(
    requestParameters: DatabaseForkOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabase201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError('databaseId', 'Required parameter "databaseId" was null or undefined when calling databaseFork().');
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/fork`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: DatabaseForkRequestToJSON(requestParameters['databaseForkRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabase201ResponseFromJSON(jsonValue));
  }

  /**
   * Fork a Managed Database to a new subscription from a backup.
   * Fork Managed Database
   */
  async databaseFork(
    databaseId: string,
    databaseForkRequest?: DatabaseForkRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDatabase201Response> {
    const response = await this.databaseForkRaw({ databaseId: databaseId, databaseForkRequest: databaseForkRequest }, initOverrides);
    return await response.value();
  }

  /**
   * Promote a read-only replica node to its own primary Managed Database.
   * Promote Read-Only Replica
   */
  async databasePromoteReadReplicaRaw(
    requestParameters: DatabasePromoteReadReplicaRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling databasePromoteReadReplica().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/promote-read-replica`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Promote a read-only replica node to its own primary Managed Database.
   * Promote Read-Only Replica
   */
  async databasePromoteReadReplica(databaseId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.databasePromoteReadReplicaRaw({ databaseId: databaseId }, initOverrides);
  }

  /**
   * Create a new Managed Database from a backup.
   * Restore from Backup
   */
  async databaseRestoreFromBackupRaw(
    requestParameters: DatabaseRestoreFromBackupOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabase201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling databaseRestoreFromBackup().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/restore`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: DatabaseRestoreFromBackupRequestToJSON(requestParameters['databaseRestoreFromBackupRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabase201ResponseFromJSON(jsonValue));
  }

  /**
   * Create a new Managed Database from a backup.
   * Restore from Backup
   */
  async databaseRestoreFromBackup(
    databaseId: string,
    databaseRestoreFromBackupRequest?: DatabaseRestoreFromBackupRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDatabase201Response> {
    const response = await this.databaseRestoreFromBackupRaw(
      { databaseId: databaseId, databaseRestoreFromBackupRequest: databaseRestoreFromBackupRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Start a migration to the Managed Database.
   * Start Migration
   */
  async databaseStartMigrationRaw(
    requestParameters: DatabaseStartMigrationOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ViewMigrationStatus200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling databaseStartMigration().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/migration`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: DatabaseStartMigrationRequestToJSON(requestParameters['databaseStartMigrationRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ViewMigrationStatus200ResponseFromJSON(jsonValue));
  }

  /**
   * Start a migration to the Managed Database.
   * Start Migration
   */
  async databaseStartMigration(
    databaseId: string,
    databaseStartMigrationRequest?: DatabaseStartMigrationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ViewMigrationStatus200Response> {
    const response = await this.databaseStartMigrationRaw(
      { databaseId: databaseId, databaseStartMigrationRequest: databaseStartMigrationRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Delete a connection pool within a Managed Database (PostgreSQL engine types only).
   * Delete Connection Pool
   */
  async deleteConnectionPoolRaw(
    requestParameters: DeleteConnectionPoolRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling deleteConnectionPool().',
      );
    }

    if (requestParameters['poolName'] == null) {
      throw new runtime.RequiredError(
        'poolName',
        'Required parameter "poolName" was null or undefined when calling deleteConnectionPool().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/connection-pools/{pool-name}`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'pool-name'}}`, encodeURIComponent(String(requestParameters['poolName'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'DELETE',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Delete a connection pool within a Managed Database (PostgreSQL engine types only).
   * Delete Connection Pool
   */
  async deleteConnectionPool(
    databaseId: string,
    poolName: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.deleteConnectionPoolRaw({ databaseId: databaseId, poolName: poolName }, initOverrides);
  }

  /**
   * Delete a Managed Database.
   * Delete Managed Database
   */
  async deleteDatabaseRaw(
    requestParameters: DeleteDatabaseRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError('databaseId', 'Required parameter "databaseId" was null or undefined when calling deleteDatabase().');
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'DELETE',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Delete a Managed Database.
   * Delete Managed Database
   */
  async deleteDatabase(databaseId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.deleteDatabaseRaw({ databaseId: databaseId }, initOverrides);
  }

  /**
   * Delete a connector within a Managed Database (Kafka engine types only).
   * Delete Database Connector
   */
  async deleteDatabaseConnectorRaw(
    requestParameters: DeleteDatabaseConnectorRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling deleteDatabaseConnector().',
      );
    }

    if (requestParameters['connectorName'] == null) {
      throw new runtime.RequiredError(
        'connectorName',
        'Required parameter "connectorName" was null or undefined when calling deleteDatabaseConnector().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/connectors/{connector-name}`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'connector-name'}}`, encodeURIComponent(String(requestParameters['connectorName'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'DELETE',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Delete a connector within a Managed Database (Kafka engine types only).
   * Delete Database Connector
   */
  async deleteDatabaseConnector(
    databaseId: string,
    connectorName: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.deleteDatabaseConnectorRaw({ databaseId: databaseId, connectorName: connectorName }, initOverrides);
  }

  /**
   * Delete a logical database within a Managed Database (MySQL and PostgreSQL only).
   * Delete Logical Database
   */
  async deleteDatabaseDbRaw(
    requestParameters: DeleteDatabaseDbRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling deleteDatabaseDb().',
      );
    }

    if (requestParameters['dbName'] == null) {
      throw new runtime.RequiredError('dbName', 'Required parameter "dbName" was null or undefined when calling deleteDatabaseDb().');
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/dbs/{db-name}`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'db-name'}}`, encodeURIComponent(String(requestParameters['dbName'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'DELETE',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Delete a logical database within a Managed Database (MySQL and PostgreSQL only).
   * Delete Logical Database
   */
  async deleteDatabaseDb(databaseId: string, dbName: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.deleteDatabaseDbRaw({ databaseId: databaseId, dbName: dbName }, initOverrides);
  }

  /**
   * Delete a quota within a Managed Database (Kafka engine types only).
   * Delete Database Quota
   */
  async deleteDatabaseQuotaRaw(
    requestParameters: DeleteDatabaseQuotaRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling deleteDatabaseQuota().',
      );
    }

    if (requestParameters['clientId'] == null) {
      throw new runtime.RequiredError(
        'clientId',
        'Required parameter "clientId" was null or undefined when calling deleteDatabaseQuota().',
      );
    }

    if (requestParameters['username'] == null) {
      throw new runtime.RequiredError(
        'username',
        'Required parameter "username" was null or undefined when calling deleteDatabaseQuota().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/quotas/{client-id}/{username}`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'client-id'}}`, encodeURIComponent(String(requestParameters['clientId'])));
    urlPath = urlPath.replace(`{${'username'}}`, encodeURIComponent(String(requestParameters['username'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'DELETE',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Delete a quota within a Managed Database (Kafka engine types only).
   * Delete Database Quota
   */
  async deleteDatabaseQuota(
    databaseId: string,
    clientId: string,
    username: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.deleteDatabaseQuotaRaw({ databaseId: databaseId, clientId: clientId, username: username }, initOverrides);
  }

  /**
   * Delete a topic within a Managed Database (Kafka engine types only).
   * Delete Database Topic
   */
  async deleteDatabaseTopicRaw(
    requestParameters: DeleteDatabaseTopicRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling deleteDatabaseTopic().',
      );
    }

    if (requestParameters['topicName'] == null) {
      throw new runtime.RequiredError(
        'topicName',
        'Required parameter "topicName" was null or undefined when calling deleteDatabaseTopic().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/topics/{topic-name}`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'topic-name'}}`, encodeURIComponent(String(requestParameters['topicName'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'DELETE',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Delete a topic within a Managed Database (Kafka engine types only).
   * Delete Database Topic
   */
  async deleteDatabaseTopic(
    databaseId: string,
    topicName: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.deleteDatabaseTopicRaw({ databaseId: databaseId, topicName: topicName }, initOverrides);
  }

  /**
   * Delete a database user within a Managed Database.
   * Delete Database User
   */
  async deleteDatabaseUserRaw(
    requestParameters: DeleteDatabaseUserRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling deleteDatabaseUser().',
      );
    }

    if (requestParameters['username'] == null) {
      throw new runtime.RequiredError('username', 'Required parameter "username" was null or undefined when calling deleteDatabaseUser().');
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/users/{username}`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'username'}}`, encodeURIComponent(String(requestParameters['username'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'DELETE',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Delete a database user within a Managed Database.
   * Delete Database User
   */
  async deleteDatabaseUser(
    databaseId: string,
    username: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.deleteDatabaseUserRaw({ databaseId: databaseId, username: username }, initOverrides);
  }

  /**
   * Get backup information for the Managed Database.
   * Get Backup Information
   */
  async getBackupInformationRaw(
    requestParameters: GetBackupInformationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetBackupInformation200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling getBackupInformation().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/backups`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetBackupInformation200ResponseFromJSON(jsonValue));
  }

  /**
   * Get backup information for the Managed Database.
   * Get Backup Information
   */
  async getBackupInformation(
    databaseId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetBackupInformation200Response> {
    const response = await this.getBackupInformationRaw({ databaseId: databaseId }, initOverrides);
    return await response.value();
  }

  /**
   * Get information about a Managed Database connection pool (PostgreSQL engine types only).
   * Get Connection Pool
   */
  async getConnectionPoolRaw(
    requestParameters: GetConnectionPoolRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateConnectionPool201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling getConnectionPool().',
      );
    }

    if (requestParameters['poolName'] == null) {
      throw new runtime.RequiredError('poolName', 'Required parameter "poolName" was null or undefined when calling getConnectionPool().');
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/connection-pools/{pool-name}`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'pool-name'}}`, encodeURIComponent(String(requestParameters['poolName'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateConnectionPool201ResponseFromJSON(jsonValue));
  }

  /**
   * Get information about a Managed Database connection pool (PostgreSQL engine types only).
   * Get Connection Pool
   */
  async getConnectionPool(
    databaseId: string,
    poolName: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateConnectionPool201Response> {
    const response = await this.getConnectionPoolRaw({ databaseId: databaseId, poolName: poolName }, initOverrides);
    return await response.value();
  }

  /**
   * Get information about a Managed Database.
   * Get Managed Database
   */
  async getDatabaseRaw(
    requestParameters: GetDatabaseRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabase201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError('databaseId', 'Required parameter "databaseId" was null or undefined when calling getDatabase().');
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabase201ResponseFromJSON(jsonValue));
  }

  /**
   * Get information about a Managed Database.
   * Get Managed Database
   */
  async getDatabase(databaseId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<CreateDatabase201Response> {
    const response = await this.getDatabaseRaw({ databaseId: databaseId }, initOverrides);
    return await response.value();
  }

  /**
   * Get information about a Managed Database connector (Kafka engine types only).
   * Get Database Connector
   */
  async getDatabaseConnectorRaw(
    requestParameters: GetDatabaseConnectorRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabaseConnector201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling getDatabaseConnector().',
      );
    }

    if (requestParameters['connectorName'] == null) {
      throw new runtime.RequiredError(
        'connectorName',
        'Required parameter "connectorName" was null or undefined when calling getDatabaseConnector().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/connectors/{connector-name}`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'connector-name'}}`, encodeURIComponent(String(requestParameters['connectorName'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabaseConnector201ResponseFromJSON(jsonValue));
  }

  /**
   * Get information about a Managed Database connector (Kafka engine types only).
   * Get Database Connector
   */
  async getDatabaseConnector(
    databaseId: string,
    connectorName: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDatabaseConnector201Response> {
    const response = await this.getDatabaseConnectorRaw({ databaseId: databaseId, connectorName: connectorName }, initOverrides);
    return await response.value();
  }

  /**
   * Get the configuration schema for the Managed Database connector (Kafka engine types only).
   * Get Database Connector Configuration Schema
   */
  async getDatabaseConnectorConfigurationSchemaRaw(
    requestParameters: GetDatabaseConnectorConfigurationSchemaRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetDatabaseConnectorConfigurationSchema200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling getDatabaseConnectorConfigurationSchema().',
      );
    }

    if (requestParameters['connectorClass'] == null) {
      throw new runtime.RequiredError(
        'connectorClass',
        'Required parameter "connectorClass" was null or undefined when calling getDatabaseConnectorConfigurationSchema().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/available-connectors/{connector-class}/configuration`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'connector-class'}}`, encodeURIComponent(String(requestParameters['connectorClass'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetDatabaseConnectorConfigurationSchema200ResponseFromJSON(jsonValue));
  }

  /**
   * Get the configuration schema for the Managed Database connector (Kafka engine types only).
   * Get Database Connector Configuration Schema
   */
  async getDatabaseConnectorConfigurationSchema(
    databaseId: string,
    connectorClass: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetDatabaseConnectorConfigurationSchema200Response> {
    const response = await this.getDatabaseConnectorConfigurationSchemaRaw(
      { databaseId: databaseId, connectorClass: connectorClass },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Get status information about a Managed Database connector (Kafka engine types only).
   * Get Database Connector Status
   */
  async getDatabaseConnectorStatusRaw(
    requestParameters: GetDatabaseConnectorStatusRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetDatabaseConnectorStatus200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling getDatabaseConnectorStatus().',
      );
    }

    if (requestParameters['connectorName'] == null) {
      throw new runtime.RequiredError(
        'connectorName',
        'Required parameter "connectorName" was null or undefined when calling getDatabaseConnectorStatus().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/connectors/{connector-name}/status`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'connector-name'}}`, encodeURIComponent(String(requestParameters['connectorName'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetDatabaseConnectorStatus200ResponseFromJSON(jsonValue));
  }

  /**
   * Get status information about a Managed Database connector (Kafka engine types only).
   * Get Database Connector Status
   */
  async getDatabaseConnectorStatus(
    databaseId: string,
    connectorName: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetDatabaseConnectorStatus200Response> {
    const response = await this.getDatabaseConnectorStatusRaw({ databaseId: databaseId, connectorName: connectorName }, initOverrides);
    return await response.value();
  }

  /**
   * Get information about a logical database within a Managed Database (MySQL and PostgreSQL only).
   * Get Logical Database
   */
  async getDatabaseDbRaw(
    requestParameters: GetDatabaseDbRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabaseDb201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError('databaseId', 'Required parameter "databaseId" was null or undefined when calling getDatabaseDb().');
    }

    if (requestParameters['dbName'] == null) {
      throw new runtime.RequiredError('dbName', 'Required parameter "dbName" was null or undefined when calling getDatabaseDb().');
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/dbs/{db-name}`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'db-name'}}`, encodeURIComponent(String(requestParameters['dbName'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabaseDb201ResponseFromJSON(jsonValue));
  }

  /**
   * Get information about a logical database within a Managed Database (MySQL and PostgreSQL only).
   * Get Logical Database
   */
  async getDatabaseDb(
    databaseId: string,
    dbName: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDatabaseDb201Response> {
    const response = await this.getDatabaseDbRaw({ databaseId: databaseId, dbName: dbName }, initOverrides);
    return await response.value();
  }

  /**
   * Get information about a Managed Database quota (Kafka engine types only).
   * Get Database Quota
   */
  async getDatabaseQuotaRaw(
    requestParameters: GetDatabaseQuotaRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabaseQuota201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling getDatabaseQuota().',
      );
    }

    if (requestParameters['clientId'] == null) {
      throw new runtime.RequiredError('clientId', 'Required parameter "clientId" was null or undefined when calling getDatabaseQuota().');
    }

    if (requestParameters['username'] == null) {
      throw new runtime.RequiredError('username', 'Required parameter "username" was null or undefined when calling getDatabaseQuota().');
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/quotas/{client-id}/{username}`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'client-id'}}`, encodeURIComponent(String(requestParameters['clientId'])));
    urlPath = urlPath.replace(`{${'username'}}`, encodeURIComponent(String(requestParameters['username'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabaseQuota201ResponseFromJSON(jsonValue));
  }

  /**
   * Get information about a Managed Database quota (Kafka engine types only).
   * Get Database Quota
   */
  async getDatabaseQuota(
    databaseId: string,
    clientId: string,
    username: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDatabaseQuota201Response> {
    const response = await this.getDatabaseQuotaRaw({ databaseId: databaseId, clientId: clientId, username: username }, initOverrides);
    return await response.value();
  }

  /**
   * Get information about a Managed Database topic (Kafka engine types only).
   * Get Database Topic
   */
  async getDatabaseTopicRaw(
    requestParameters: GetDatabaseTopicRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabaseTopic201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling getDatabaseTopic().',
      );
    }

    if (requestParameters['topicName'] == null) {
      throw new runtime.RequiredError('topicName', 'Required parameter "topicName" was null or undefined when calling getDatabaseTopic().');
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/topics/{topic-name}`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'topic-name'}}`, encodeURIComponent(String(requestParameters['topicName'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabaseTopic201ResponseFromJSON(jsonValue));
  }

  /**
   * Get information about a Managed Database topic (Kafka engine types only).
   * Get Database Topic
   */
  async getDatabaseTopic(
    databaseId: string,
    topicName: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDatabaseTopic201Response> {
    const response = await this.getDatabaseTopicRaw({ databaseId: databaseId, topicName: topicName }, initOverrides);
    return await response.value();
  }

  /**
   * Get disk, memory, and vCPU usage information for a Managed Database.
   * Get Database Usage Information
   */
  async getDatabaseUsageRaw(
    requestParameters: GetDatabaseUsageRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetDatabaseUsage200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling getDatabaseUsage().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/usage`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetDatabaseUsage200ResponseFromJSON(jsonValue));
  }

  /**
   * Get disk, memory, and vCPU usage information for a Managed Database.
   * Get Database Usage Information
   */
  async getDatabaseUsage(
    databaseId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetDatabaseUsage200Response> {
    const response = await this.getDatabaseUsageRaw({ databaseId: databaseId }, initOverrides);
    return await response.value();
  }

  /**
   * Get information about a Managed Database user.
   * Get Database User
   */
  async getDatabaseUserRaw(
    requestParameters: GetDatabaseUserRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabaseUser201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling getDatabaseUser().',
      );
    }

    if (requestParameters['username'] == null) {
      throw new runtime.RequiredError('username', 'Required parameter "username" was null or undefined when calling getDatabaseUser().');
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/users/{username}`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'username'}}`, encodeURIComponent(String(requestParameters['username'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabaseUser201ResponseFromJSON(jsonValue));
  }

  /**
   * Get information about a Managed Database user.
   * Get Database User
   */
  async getDatabaseUser(
    databaseId: string,
    username: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDatabaseUser201Response> {
    const response = await this.getDatabaseUserRaw({ databaseId: databaseId, username: username }, initOverrides);
    return await response.value();
  }

  /**
   * List all configured and available advanced options for the Managed Database (MySQL, PostgreSQL, and Kafka engine types only).
   * List Advanced Options
   */
  async listAdvancedOptionsRaw(
    requestParameters: ListAdvancedOptionsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListAdvancedOptions200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling listAdvancedOptions().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/advanced-options`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListAdvancedOptions200ResponseFromJSON(jsonValue));
  }

  /**
   * List all configured and available advanced options for the Managed Database (MySQL, PostgreSQL, and Kafka engine types only).
   * List Advanced Options
   */
  async listAdvancedOptions(
    databaseId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListAdvancedOptions200Response> {
    const response = await this.listAdvancedOptionsRaw({ databaseId: databaseId }, initOverrides);
    return await response.value();
  }

  /**
   * List all configured and available Kafka Connect advanced options for the Managed Database (Kafka engine types only on business plans or higher).
   * List Kafka Connect Advanced Options
   */
  async listAdvancedOptionsKafkaConnectRaw(
    requestParameters: ListAdvancedOptionsKafkaConnectRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListAdvancedOptions200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling listAdvancedOptionsKafkaConnect().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/advanced-options/kafka-connect`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListAdvancedOptions200ResponseFromJSON(jsonValue));
  }

  /**
   * List all configured and available Kafka Connect advanced options for the Managed Database (Kafka engine types only on business plans or higher).
   * List Kafka Connect Advanced Options
   */
  async listAdvancedOptionsKafkaConnect(
    databaseId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListAdvancedOptions200Response> {
    const response = await this.listAdvancedOptionsKafkaConnectRaw({ databaseId: databaseId }, initOverrides);
    return await response.value();
  }

  /**
   * List all configured and available Kafka REST advanced options for the Managed Database (Kafka engine types only on business plans or higher).
   * List Kafka REST Advanced Options
   */
  async listAdvancedOptionsKafkaRestRaw(
    requestParameters: ListAdvancedOptionsKafkaRestRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListAdvancedOptions200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling listAdvancedOptionsKafkaRest().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/advanced-options/kafka-rest`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListAdvancedOptions200ResponseFromJSON(jsonValue));
  }

  /**
   * List all configured and available Kafka REST advanced options for the Managed Database (Kafka engine types only on business plans or higher).
   * List Kafka REST Advanced Options
   */
  async listAdvancedOptionsKafkaRest(
    databaseId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListAdvancedOptions200Response> {
    const response = await this.listAdvancedOptionsKafkaRestRaw({ databaseId: databaseId }, initOverrides);
    return await response.value();
  }

  /**
   * List all configured and available Schema Registry advanced options for the Managed Database (Kafka engine types only on business plans or higher).
   * List Schema Registry Advanced Options
   */
  async listAdvancedOptionsSchemaRegistryRaw(
    requestParameters: ListAdvancedOptionsSchemaRegistryRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListAdvancedOptions200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling listAdvancedOptionsSchemaRegistry().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/advanced-options/schema-registry`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListAdvancedOptions200ResponseFromJSON(jsonValue));
  }

  /**
   * List all configured and available Schema Registry advanced options for the Managed Database (Kafka engine types only on business plans or higher).
   * List Schema Registry Advanced Options
   */
  async listAdvancedOptionsSchemaRegistry(
    databaseId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListAdvancedOptions200Response> {
    const response = await this.listAdvancedOptionsSchemaRegistryRaw({ databaseId: databaseId }, initOverrides);
    return await response.value();
  }

  /**
   * List all available version upgrades within the Managed Database (PostgreSQL and Kafka engine types only).
   * List Available Versions
   */
  async listAvailableVersionsRaw(
    requestParameters: ListAvailableVersionsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListAvailableVersions200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling listAvailableVersions().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/version-upgrade`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListAvailableVersions200ResponseFromJSON(jsonValue));
  }

  /**
   * List all available version upgrades within the Managed Database (PostgreSQL and Kafka engine types only).
   * List Available Versions
   */
  async listAvailableVersions(
    databaseId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListAvailableVersions200Response> {
    const response = await this.listAvailableVersionsRaw({ databaseId: databaseId }, initOverrides);
    return await response.value();
  }

  /**
   * List all connection pools within the Managed Database (PostgreSQL engine types only).
   * List Connection Pools
   */
  async listConnectionPoolsRaw(
    requestParameters: ListConnectionPoolsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListConnectionPools200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling listConnectionPools().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/connection-pools`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListConnectionPools200ResponseFromJSON(jsonValue));
  }

  /**
   * List all connection pools within the Managed Database (PostgreSQL engine types only).
   * List Connection Pools
   */
  async listConnectionPools(
    databaseId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListConnectionPools200Response> {
    const response = await this.listConnectionPoolsRaw({ databaseId: databaseId }, initOverrides);
    return await response.value();
  }

  /**
   * List all available connectors for the Managed Database (Kafka engine types only).
   * List Database Available Connectors
   */
  async listDatabaseAvailableConnectorsRaw(
    requestParameters: ListDatabaseAvailableConnectorsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListDatabaseAvailableConnectors200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling listDatabaseAvailableConnectors().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/available-connectors`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListDatabaseAvailableConnectors200ResponseFromJSON(jsonValue));
  }

  /**
   * List all available connectors for the Managed Database (Kafka engine types only).
   * List Database Available Connectors
   */
  async listDatabaseAvailableConnectors(
    databaseId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListDatabaseAvailableConnectors200Response> {
    const response = await this.listDatabaseAvailableConnectorsRaw({ databaseId: databaseId }, initOverrides);
    return await response.value();
  }

  /**
   * List all connectors within the Managed Database (Kafka engine types only).
   * List Database Connectors
   */
  async listDatabaseConnectorsRaw(
    requestParameters: ListDatabaseConnectorsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListDatabaseConnectors200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling listDatabaseConnectors().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/connectors`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListDatabaseConnectors200ResponseFromJSON(jsonValue));
  }

  /**
   * List all connectors within the Managed Database (Kafka engine types only).
   * List Database Connectors
   */
  async listDatabaseConnectors(
    databaseId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListDatabaseConnectors200Response> {
    const response = await this.listDatabaseConnectorsRaw({ databaseId: databaseId }, initOverrides);
    return await response.value();
  }

  /**
   * List all logical databases within the Managed Database (MySQL and PostgreSQL only).
   * List Logical Databases
   */
  async listDatabaseDbsRaw(
    requestParameters: ListDatabaseDbsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListDatabaseDbs200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling listDatabaseDbs().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/dbs`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListDatabaseDbs200ResponseFromJSON(jsonValue));
  }

  /**
   * List all logical databases within the Managed Database (MySQL and PostgreSQL only).
   * List Logical Databases
   */
  async listDatabaseDbs(
    databaseId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListDatabaseDbs200Response> {
    const response = await this.listDatabaseDbsRaw({ databaseId: databaseId }, initOverrides);
    return await response.value();
  }

  /**
   * List all Managed Databases plans.
   * List Managed Database Plans
   */
  async listDatabasePlansRaw(
    requestParameters: ListDatabasePlansRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListDatabasePlans200Response>> {
    const queryParameters: any = {};

    if (requestParameters['engine'] != null) {
      queryParameters['engine'] = requestParameters['engine'];
    }

    if (requestParameters['nodes'] != null) {
      queryParameters['nodes'] = requestParameters['nodes'];
    }

    if (requestParameters['region'] != null) {
      queryParameters['region'] = requestParameters['region'];
    }

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/plans`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListDatabasePlans200ResponseFromJSON(jsonValue));
  }

  /**
   * List all Managed Databases plans.
   * List Managed Database Plans
   */
  async listDatabasePlans(
    engine?: string,
    nodes?: number,
    region?: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListDatabasePlans200Response> {
    const response = await this.listDatabasePlansRaw({ engine: engine, nodes: nodes, region: region }, initOverrides);
    return await response.value();
  }

  /**
   * List all quotas within the Managed Database (Kafka engine types only).
   * List Database Quotas
   */
  async listDatabaseQuotasRaw(
    requestParameters: ListDatabaseQuotasRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListDatabaseQuotas200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling listDatabaseQuotas().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/quotas`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListDatabaseQuotas200ResponseFromJSON(jsonValue));
  }

  /**
   * List all quotas within the Managed Database (Kafka engine types only).
   * List Database Quotas
   */
  async listDatabaseQuotas(
    databaseId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListDatabaseQuotas200Response> {
    const response = await this.listDatabaseQuotasRaw({ databaseId: databaseId }, initOverrides);
    return await response.value();
  }

  /**
   * List all topics within the Managed Database (Kafka engine types only).
   * List Database Topics
   */
  async listDatabaseTopicsRaw(
    requestParameters: ListDatabaseTopicsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListDatabaseTopics200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling listDatabaseTopics().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/topics`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListDatabaseTopics200ResponseFromJSON(jsonValue));
  }

  /**
   * List all topics within the Managed Database (Kafka engine types only).
   * List Database Topics
   */
  async listDatabaseTopics(
    databaseId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListDatabaseTopics200Response> {
    const response = await this.listDatabaseTopicsRaw({ databaseId: databaseId }, initOverrides);
    return await response.value();
  }

  /**
   * List all database users within the Managed Database.
   * List Database Users
   */
  async listDatabaseUsersRaw(
    requestParameters: ListDatabaseUsersRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListDatabaseUsers200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling listDatabaseUsers().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/users`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListDatabaseUsers200ResponseFromJSON(jsonValue));
  }

  /**
   * List all database users within the Managed Database.
   * List Database Users
   */
  async listDatabaseUsers(
    databaseId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListDatabaseUsers200Response> {
    const response = await this.listDatabaseUsersRaw({ databaseId: databaseId }, initOverrides);
    return await response.value();
  }

  /**
   * List all Managed Databases in your account.
   * List Managed Databases
   */
  async listDatabasesRaw(
    requestParameters: ListDatabasesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListDatabases200Response>> {
    const queryParameters: any = {};

    if (requestParameters['label'] != null) {
      queryParameters['label'] = requestParameters['label'];
    }

    if (requestParameters['tag'] != null) {
      queryParameters['tag'] = requestParameters['tag'];
    }

    if (requestParameters['region'] != null) {
      queryParameters['region'] = requestParameters['region'];
    }

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListDatabases200ResponseFromJSON(jsonValue));
  }

  /**
   * List all Managed Databases in your account.
   * List Managed Databases
   */
  async listDatabases(
    label?: string,
    tag?: string,
    region?: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListDatabases200Response> {
    const response = await this.listDatabasesRaw({ label: label, tag: tag, region: region }, initOverrides);
    return await response.value();
  }

  /**
   * List all available maintenance updates within the Managed Database.
   * List Maintenance Updates
   */
  async listMaintenanceUpdatesRaw(
    requestParameters: ListMaintenanceUpdatesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListMaintenanceUpdates200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling listMaintenanceUpdates().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/maintenance`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListMaintenanceUpdates200ResponseFromJSON(jsonValue));
  }

  /**
   * List all available maintenance updates within the Managed Database.
   * List Maintenance Updates
   */
  async listMaintenanceUpdates(
    databaseId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListMaintenanceUpdates200Response> {
    const response = await this.listMaintenanceUpdatesRaw({ databaseId: databaseId }, initOverrides);
    return await response.value();
  }

  /**
   * List service alert messages for the Managed Database.
   * List Service Alerts
   */
  async listServiceAlertsRaw(
    requestParameters: ListServiceAlertsOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListServiceAlerts200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling listServiceAlerts().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/alerts`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: ListServiceAlertsRequestToJSON(requestParameters['listServiceAlertsRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListServiceAlerts200ResponseFromJSON(jsonValue));
  }

  /**
   * List service alert messages for the Managed Database.
   * List Service Alerts
   */
  async listServiceAlerts(
    databaseId: string,
    listServiceAlertsRequest?: ListServiceAlertsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListServiceAlerts200Response> {
    const response = await this.listServiceAlertsRaw(
      { databaseId: databaseId, listServiceAlertsRequest: listServiceAlertsRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Pause a connector within a Managed Database (Kafka engine types only).
   * Pause Database Connector
   */
  async pauseDatabaseConnectorRaw(
    requestParameters: PauseDatabaseConnectorRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling pauseDatabaseConnector().',
      );
    }

    if (requestParameters['connectorName'] == null) {
      throw new runtime.RequiredError(
        'connectorName',
        'Required parameter "connectorName" was null or undefined when calling pauseDatabaseConnector().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/connectors/{connector-name}/pause`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'connector-name'}}`, encodeURIComponent(String(requestParameters['connectorName'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Pause a connector within a Managed Database (Kafka engine types only).
   * Pause Database Connector
   */
  async pauseDatabaseConnector(
    databaseId: string,
    connectorName: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.pauseDatabaseConnectorRaw({ databaseId: databaseId, connectorName: connectorName }, initOverrides);
  }

  /**
   * Restart a connector within a Managed Database (Kafka engine types only).
   * Restart Database Connector
   */
  async restartDatabaseConnectorRaw(
    requestParameters: RestartDatabaseConnectorRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling restartDatabaseConnector().',
      );
    }

    if (requestParameters['connectorName'] == null) {
      throw new runtime.RequiredError(
        'connectorName',
        'Required parameter "connectorName" was null or undefined when calling restartDatabaseConnector().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/connectors/{connector-name}/restart`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'connector-name'}}`, encodeURIComponent(String(requestParameters['connectorName'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Restart a connector within a Managed Database (Kafka engine types only).
   * Restart Database Connector
   */
  async restartDatabaseConnector(
    databaseId: string,
    connectorName: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.restartDatabaseConnectorRaw({ databaseId: databaseId, connectorName: connectorName }, initOverrides);
  }

  /**
   * Restart a task within a Managed Database connector (Kafka engine types only).
   * Restart Database Connector Task
   */
  async restartDatabaseConnectorTaskRaw(
    requestParameters: RestartDatabaseConnectorTaskRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling restartDatabaseConnectorTask().',
      );
    }

    if (requestParameters['connectorName'] == null) {
      throw new runtime.RequiredError(
        'connectorName',
        'Required parameter "connectorName" was null or undefined when calling restartDatabaseConnectorTask().',
      );
    }

    if (requestParameters['taskId'] == null) {
      throw new runtime.RequiredError(
        'taskId',
        'Required parameter "taskId" was null or undefined when calling restartDatabaseConnectorTask().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/connectors/{connector-name}/tasks/{task-id}/restart`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'connector-name'}}`, encodeURIComponent(String(requestParameters['connectorName'])));
    urlPath = urlPath.replace(`{${'task-id'}}`, encodeURIComponent(String(requestParameters['taskId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Restart a task within a Managed Database connector (Kafka engine types only).
   * Restart Database Connector Task
   */
  async restartDatabaseConnectorTask(
    databaseId: string,
    connectorName: string,
    taskId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.restartDatabaseConnectorTaskRaw({ databaseId: databaseId, connectorName: connectorName, taskId: taskId }, initOverrides);
  }

  /**
   * Resume a paused connector within a Managed Database (Kafka engine types only).
   * Resume Database Connector
   */
  async resumeDatabaseConnectorRaw(
    requestParameters: ResumeDatabaseConnectorRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling resumeDatabaseConnector().',
      );
    }

    if (requestParameters['connectorName'] == null) {
      throw new runtime.RequiredError(
        'connectorName',
        'Required parameter "connectorName" was null or undefined when calling resumeDatabaseConnector().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/connectors/{connector-name}/resume`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'connector-name'}}`, encodeURIComponent(String(requestParameters['connectorName'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Resume a paused connector within a Managed Database (Kafka engine types only).
   * Resume Database Connector
   */
  async resumeDatabaseConnector(
    databaseId: string,
    connectorName: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.resumeDatabaseConnectorRaw({ databaseId: databaseId, connectorName: connectorName }, initOverrides);
  }

  /**
   * Configure access control settings for a Managed Database user (Valkey and Kafka engine types only).
   * Set Database User Access Control
   */
  async setDatabaseUserAclRaw(
    requestParameters: SetDatabaseUserAclOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabaseUser201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling setDatabaseUserAcl().',
      );
    }

    if (requestParameters['username'] == null) {
      throw new runtime.RequiredError('username', 'Required parameter "username" was null or undefined when calling setDatabaseUserAcl().');
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/users/{username}/access-control`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'username'}}`, encodeURIComponent(String(requestParameters['username'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: SetDatabaseUserAclRequestToJSON(requestParameters['setDatabaseUserAclRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabaseUser201ResponseFromJSON(jsonValue));
  }

  /**
   * Configure access control settings for a Managed Database user (Valkey and Kafka engine types only).
   * Set Database User Access Control
   */
  async setDatabaseUserAcl(
    databaseId: string,
    username: string,
    setDatabaseUserAclRequest?: SetDatabaseUserAclRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDatabaseUser201Response> {
    const response = await this.setDatabaseUserAclRaw(
      { databaseId: databaseId, username: username, setDatabaseUserAclRequest: setDatabaseUserAclRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Start maintenance updates for the Managed Database.
   * Start Maintenance Updates
   */
  async startMaintenanceUpdatesRaw(
    requestParameters: StartMaintenanceUpdatesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<StartMaintenanceUpdates200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling startMaintenanceUpdates().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/maintenance`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => StartMaintenanceUpdates200ResponseFromJSON(jsonValue));
  }

  /**
   * Start maintenance updates for the Managed Database.
   * Start Maintenance Updates
   */
  async startMaintenanceUpdates(
    databaseId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<StartMaintenanceUpdates200Response> {
    const response = await this.startMaintenanceUpdatesRaw({ databaseId: databaseId }, initOverrides);
    return await response.value();
  }

  /**
   * Start a version upgrade for the Managed Database (PostgreSQL and Kafka engine types only).
   * Start Version Upgrade
   */
  async startVersionUpgradeRaw(
    requestParameters: StartVersionUpgradeOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<StartVersionUpgrade200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling startVersionUpgrade().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/version-upgrade`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: StartVersionUpgradeRequestToJSON(requestParameters['startVersionUpgradeRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => StartVersionUpgrade200ResponseFromJSON(jsonValue));
  }

  /**
   * Start a version upgrade for the Managed Database (PostgreSQL and Kafka engine types only).
   * Start Version Upgrade
   */
  async startVersionUpgrade(
    databaseId: string,
    startVersionUpgradeRequest?: StartVersionUpgradeRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<StartVersionUpgrade200Response> {
    const response = await this.startVersionUpgradeRaw(
      { databaseId: databaseId, startVersionUpgradeRequest: startVersionUpgradeRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Updates an advanced configuration option for the Managed Database (MySQL, PostgreSQL, and Kafka engine types only).
   * Update Advanced Options
   */
  async updateAdvancedOptionsRaw(
    requestParameters: UpdateAdvancedOptionsOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListAdvancedOptions200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling updateAdvancedOptions().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/advanced-options`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: UpdateAdvancedOptionsRequestToJSON(requestParameters['updateAdvancedOptionsRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListAdvancedOptions200ResponseFromJSON(jsonValue));
  }

  /**
   * Updates an advanced configuration option for the Managed Database (MySQL, PostgreSQL, and Kafka engine types only).
   * Update Advanced Options
   */
  async updateAdvancedOptions(
    databaseId: string,
    updateAdvancedOptionsRequest?: UpdateAdvancedOptionsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListAdvancedOptions200Response> {
    const response = await this.updateAdvancedOptionsRaw(
      { databaseId: databaseId, updateAdvancedOptionsRequest: updateAdvancedOptionsRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Updates a Kafka Connect advanced configuration option for the Managed Database (Kafka engine types only on business plans or higher).
   * Update Kafka Connect Advanced Options
   */
  async updateAdvancedOptionsKafkaConnectRaw(
    requestParameters: UpdateAdvancedOptionsKafkaConnectRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListAdvancedOptions200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling updateAdvancedOptionsKafkaConnect().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/advanced-options/kafka-connect`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: KafkaConnectAdvancedOptionsToJSON(requestParameters['kafkaConnectAdvancedOptions']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListAdvancedOptions200ResponseFromJSON(jsonValue));
  }

  /**
   * Updates a Kafka Connect advanced configuration option for the Managed Database (Kafka engine types only on business plans or higher).
   * Update Kafka Connect Advanced Options
   */
  async updateAdvancedOptionsKafkaConnect(
    databaseId: string,
    kafkaConnectAdvancedOptions?: KafkaConnectAdvancedOptions,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListAdvancedOptions200Response> {
    const response = await this.updateAdvancedOptionsKafkaConnectRaw(
      { databaseId: databaseId, kafkaConnectAdvancedOptions: kafkaConnectAdvancedOptions },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Updates a Kafka REST advanced configuration option for the Managed Database (Kafka engine types only on business plans or higher).
   * Update Kafka REST Advanced Options
   */
  async updateAdvancedOptionsKafkaRestRaw(
    requestParameters: UpdateAdvancedOptionsKafkaRestRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListAdvancedOptions200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling updateAdvancedOptionsKafkaRest().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/advanced-options/kafka-rest`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: KafkaRestAdvancedOptionsToJSON(requestParameters['kafkaRestAdvancedOptions']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListAdvancedOptions200ResponseFromJSON(jsonValue));
  }

  /**
   * Updates a Kafka REST advanced configuration option for the Managed Database (Kafka engine types only on business plans or higher).
   * Update Kafka REST Advanced Options
   */
  async updateAdvancedOptionsKafkaRest(
    databaseId: string,
    kafkaRestAdvancedOptions?: KafkaRestAdvancedOptions,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListAdvancedOptions200Response> {
    const response = await this.updateAdvancedOptionsKafkaRestRaw(
      { databaseId: databaseId, kafkaRestAdvancedOptions: kafkaRestAdvancedOptions },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Updates a Schema Registry advanced configuration option for the Managed Database (Kafka engine types only on business plans or higher).
   * Update Schema Registry Advanced Options
   */
  async updateAdvancedOptionsSchemaRegistryRaw(
    requestParameters: UpdateAdvancedOptionsSchemaRegistryRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListAdvancedOptions200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling updateAdvancedOptionsSchemaRegistry().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/advanced-options/schema-registry`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: SchemaRegistryAdvancedOptionsToJSON(requestParameters['schemaRegistryAdvancedOptions']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListAdvancedOptions200ResponseFromJSON(jsonValue));
  }

  /**
   * Updates a Schema Registry advanced configuration option for the Managed Database (Kafka engine types only on business plans or higher).
   * Update Schema Registry Advanced Options
   */
  async updateAdvancedOptionsSchemaRegistry(
    databaseId: string,
    schemaRegistryAdvancedOptions?: SchemaRegistryAdvancedOptions,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListAdvancedOptions200Response> {
    const response = await this.updateAdvancedOptionsSchemaRegistryRaw(
      { databaseId: databaseId, schemaRegistryAdvancedOptions: schemaRegistryAdvancedOptions },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Update connection-pool information within a Managed Database (PostgreSQL engine types only).
   * Update Connection Pool
   */
  async updateConnectionPoolRaw(
    requestParameters: UpdateConnectionPoolOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateConnectionPool201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling updateConnectionPool().',
      );
    }

    if (requestParameters['poolName'] == null) {
      throw new runtime.RequiredError(
        'poolName',
        'Required parameter "poolName" was null or undefined when calling updateConnectionPool().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/connection-pools/{pool-name}`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'pool-name'}}`, encodeURIComponent(String(requestParameters['poolName'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: UpdateConnectionPoolRequestToJSON(requestParameters['updateConnectionPoolRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateConnectionPool201ResponseFromJSON(jsonValue));
  }

  /**
   * Update connection-pool information within a Managed Database (PostgreSQL engine types only).
   * Update Connection Pool
   */
  async updateConnectionPool(
    databaseId: string,
    poolName: string,
    updateConnectionPoolRequest?: UpdateConnectionPoolRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateConnectionPool201Response> {
    const response = await this.updateConnectionPoolRaw(
      { databaseId: databaseId, poolName: poolName, updateConnectionPoolRequest: updateConnectionPoolRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Update information for a Managed Database. All attributes are optional. If not set, the attributes will retain their original values.
   * Update Managed Database
   */
  async updateDatabaseRaw(
    requestParameters: UpdateDatabaseOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabase201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError('databaseId', 'Required parameter "databaseId" was null or undefined when calling updateDatabase().');
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: UpdateDatabaseRequestToJSON(requestParameters['updateDatabaseRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabase201ResponseFromJSON(jsonValue));
  }

  /**
   * Update information for a Managed Database. All attributes are optional. If not set, the attributes will retain their original values.
   * Update Managed Database
   */
  async updateDatabase(
    databaseId: string,
    updateDatabaseRequest?: UpdateDatabaseRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDatabase201Response> {
    const response = await this.updateDatabaseRaw({ databaseId: databaseId, updateDatabaseRequest: updateDatabaseRequest }, initOverrides);
    return await response.value();
  }

  /**
   * Update connector information within a Managed Database (Kafka engine types only).
   * Update Database Connector
   */
  async updateDatabaseConnectorRaw(
    requestParameters: UpdateDatabaseConnectorOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabaseConnector201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling updateDatabaseConnector().',
      );
    }

    if (requestParameters['connectorName'] == null) {
      throw new runtime.RequiredError(
        'connectorName',
        'Required parameter "connectorName" was null or undefined when calling updateDatabaseConnector().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/connectors/{connector-name}`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'connector-name'}}`, encodeURIComponent(String(requestParameters['connectorName'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: UpdateDatabaseConnectorRequestToJSON(requestParameters['updateDatabaseConnectorRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabaseConnector201ResponseFromJSON(jsonValue));
  }

  /**
   * Update connector information within a Managed Database (Kafka engine types only).
   * Update Database Connector
   */
  async updateDatabaseConnector(
    databaseId: string,
    connectorName: string,
    updateDatabaseConnectorRequest?: UpdateDatabaseConnectorRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDatabaseConnector201Response> {
    const response = await this.updateDatabaseConnectorRaw(
      { databaseId: databaseId, connectorName: connectorName, updateDatabaseConnectorRequest: updateDatabaseConnectorRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Update quota information within a Managed Database (Kafka engine types only).
   * Update Database Quota
   */
  async updateDatabaseQuotaRaw(
    requestParameters: UpdateDatabaseQuotaOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabaseQuota201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling updateDatabaseQuota().',
      );
    }

    if (requestParameters['clientId'] == null) {
      throw new runtime.RequiredError(
        'clientId',
        'Required parameter "clientId" was null or undefined when calling updateDatabaseQuota().',
      );
    }

    if (requestParameters['username'] == null) {
      throw new runtime.RequiredError(
        'username',
        'Required parameter "username" was null or undefined when calling updateDatabaseQuota().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/quotas/{client-id}/{username}`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'client-id'}}`, encodeURIComponent(String(requestParameters['clientId'])));
    urlPath = urlPath.replace(`{${'username'}}`, encodeURIComponent(String(requestParameters['username'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: UpdateDatabaseQuotaRequestToJSON(requestParameters['updateDatabaseQuotaRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabaseQuota201ResponseFromJSON(jsonValue));
  }

  /**
   * Update quota information within a Managed Database (Kafka engine types only).
   * Update Database Quota
   */
  async updateDatabaseQuota(
    databaseId: string,
    clientId: string,
    username: string,
    updateDatabaseQuotaRequest?: UpdateDatabaseQuotaRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDatabaseQuota201Response> {
    const response = await this.updateDatabaseQuotaRaw(
      { databaseId: databaseId, clientId: clientId, username: username, updateDatabaseQuotaRequest: updateDatabaseQuotaRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Update topic information within a Managed Database (Kafka engine types only).
   * Update Database Topic
   */
  async updateDatabaseTopicRaw(
    requestParameters: UpdateDatabaseTopicOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabaseTopic201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling updateDatabaseTopic().',
      );
    }

    if (requestParameters['topicName'] == null) {
      throw new runtime.RequiredError(
        'topicName',
        'Required parameter "topicName" was null or undefined when calling updateDatabaseTopic().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/topics/{topic-name}`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'topic-name'}}`, encodeURIComponent(String(requestParameters['topicName'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: UpdateDatabaseTopicRequestToJSON(requestParameters['updateDatabaseTopicRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabaseTopic201ResponseFromJSON(jsonValue));
  }

  /**
   * Update topic information within a Managed Database (Kafka engine types only).
   * Update Database Topic
   */
  async updateDatabaseTopic(
    databaseId: string,
    topicName: string,
    updateDatabaseTopicRequest?: UpdateDatabaseTopicRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDatabaseTopic201Response> {
    const response = await this.updateDatabaseTopicRaw(
      { databaseId: databaseId, topicName: topicName, updateDatabaseTopicRequest: updateDatabaseTopicRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Update database user information within a Managed Database.
   * Update Database User
   */
  async updateDatabaseUserRaw(
    requestParameters: UpdateDatabaseUserOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDatabaseUser201Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling updateDatabaseUser().',
      );
    }

    if (requestParameters['username'] == null) {
      throw new runtime.RequiredError('username', 'Required parameter "username" was null or undefined when calling updateDatabaseUser().');
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/users/{username}`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));
    urlPath = urlPath.replace(`{${'username'}}`, encodeURIComponent(String(requestParameters['username'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: UpdateDatabaseUserRequestToJSON(requestParameters['updateDatabaseUserRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDatabaseUser201ResponseFromJSON(jsonValue));
  }

  /**
   * Update database user information within a Managed Database.
   * Update Database User
   */
  async updateDatabaseUser(
    databaseId: string,
    username: string,
    updateDatabaseUserRequest?: UpdateDatabaseUserRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDatabaseUser201Response> {
    const response = await this.updateDatabaseUserRaw(
      { databaseId: databaseId, username: username, updateDatabaseUserRequest: updateDatabaseUserRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * View the status of a migration attached to the Managed Database.
   * Get Migration Status
   */
  async viewMigrationStatusRaw(
    requestParameters: ViewMigrationStatusRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ViewMigrationStatus200Response>> {
    if (requestParameters['databaseId'] == null) {
      throw new runtime.RequiredError(
        'databaseId',
        'Required parameter "databaseId" was null or undefined when calling viewMigrationStatus().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/databases/{database-id}/migration`;
    urlPath = urlPath.replace(`{${'database-id'}}`, encodeURIComponent(String(requestParameters['databaseId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ViewMigrationStatus200ResponseFromJSON(jsonValue));
  }

  /**
   * View the status of a migration attached to the Managed Database.
   * Get Migration Status
   */
  async viewMigrationStatus(
    databaseId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ViewMigrationStatus200Response> {
    const response = await this.viewMigrationStatusRaw({ databaseId: databaseId }, initOverrides);
    return await response.value();
  }
}
