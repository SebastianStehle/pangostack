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
  CreateRegistryRequest,
  CreateReplicationRequest,
  CreateRetentionRuleRequest,
  ExecuteRetentionPolicy201Response,
  ExecuteRetentionPolicyRequest,
  ListRegistries200Response,
  ListRegistryPlans200Response,
  ListRegistryRegions200Response,
  ListRegistryRepositories200Response,
  ListRegistryRepositoryArtifacts200Response,
  ListRegistryRobots200Response,
  ListReplications200Response,
  ListRetentionRules200Response,
  Registry,
  RegistryDockerCredentials,
  RegistryKubernetesDockerCredentials,
  RegistryRepository,
  RegistryRepositoryArtifact,
  RegistryRobot,
  Replication,
  RetentionRule,
  UpdateContainerRegistryPassword200Response,
  UpdateContainerRegistryPasswordRequest,
  UpdateRegistryRequest,
  UpdateRepositoryRequest,
  UpdateRetentionRuleRequest,
  UpdateRetentionSchedule200Response,
  UpdateRetentionScheduleRequest,
  UpdateRobotRequest,
} from '../models/index';
import {
    CreateRegistryRequestFromJSON,
    CreateRegistryRequestToJSON,
    CreateReplicationRequestFromJSON,
    CreateReplicationRequestToJSON,
    CreateRetentionRuleRequestFromJSON,
    CreateRetentionRuleRequestToJSON,
    ExecuteRetentionPolicy201ResponseFromJSON,
    ExecuteRetentionPolicy201ResponseToJSON,
    ExecuteRetentionPolicyRequestFromJSON,
    ExecuteRetentionPolicyRequestToJSON,
    ListRegistries200ResponseFromJSON,
    ListRegistries200ResponseToJSON,
    ListRegistryPlans200ResponseFromJSON,
    ListRegistryPlans200ResponseToJSON,
    ListRegistryRegions200ResponseFromJSON,
    ListRegistryRegions200ResponseToJSON,
    ListRegistryRepositories200ResponseFromJSON,
    ListRegistryRepositories200ResponseToJSON,
    ListRegistryRepositoryArtifacts200ResponseFromJSON,
    ListRegistryRepositoryArtifacts200ResponseToJSON,
    ListRegistryRobots200ResponseFromJSON,
    ListRegistryRobots200ResponseToJSON,
    ListReplications200ResponseFromJSON,
    ListReplications200ResponseToJSON,
    ListRetentionRules200ResponseFromJSON,
    ListRetentionRules200ResponseToJSON,
    RegistryFromJSON,
    RegistryToJSON,
    RegistryDockerCredentialsFromJSON,
    RegistryDockerCredentialsToJSON,
    RegistryKubernetesDockerCredentialsFromJSON,
    RegistryKubernetesDockerCredentialsToJSON,
    RegistryRepositoryFromJSON,
    RegistryRepositoryToJSON,
    RegistryRepositoryArtifactFromJSON,
    RegistryRepositoryArtifactToJSON,
    RegistryRobotFromJSON,
    RegistryRobotToJSON,
    ReplicationFromJSON,
    ReplicationToJSON,
    RetentionRuleFromJSON,
    RetentionRuleToJSON,
    UpdateContainerRegistryPassword200ResponseFromJSON,
    UpdateContainerRegistryPassword200ResponseToJSON,
    UpdateContainerRegistryPasswordRequestFromJSON,
    UpdateContainerRegistryPasswordRequestToJSON,
    UpdateRegistryRequestFromJSON,
    UpdateRegistryRequestToJSON,
    UpdateRepositoryRequestFromJSON,
    UpdateRepositoryRequestToJSON,
    UpdateRetentionRuleRequestFromJSON,
    UpdateRetentionRuleRequestToJSON,
    UpdateRetentionSchedule200ResponseFromJSON,
    UpdateRetentionSchedule200ResponseToJSON,
    UpdateRetentionScheduleRequestFromJSON,
    UpdateRetentionScheduleRequestToJSON,
    UpdateRobotRequestFromJSON,
    UpdateRobotRequestToJSON,
} from '../models/index';

export interface CreateRegistryOperationRequest {
    createRegistryRequest?: CreateRegistryRequest;
}

export interface CreateRegistryDockerCredentialsRequest {
    registryId: string;
    expirySeconds?: number;
    readWrite?: boolean;
}

export interface CreateRegistryKubernetesDockerCredentialsRequest {
    registryId: string;
    expirySeconds?: number;
    readWrite?: boolean;
    base64Encode?: boolean;
}

export interface CreateReplicationOperationRequest {
    registryId: string;
    createReplicationRequest?: CreateReplicationRequest;
}

export interface CreateRetentionRuleOperationRequest {
    registryId: string;
    createRetentionRuleRequest?: CreateRetentionRuleRequest;
}

export interface DeleteRegistryRequest {
    registryId: string;
}

export interface DeleteReplicationRequest {
    registryId: string;
    UNKNOWN_PARAMETER_NAME?: ;
}

export interface DeleteRepositoryRequest {
    registryId: string;
    repositoryImage: string;
}

export interface DeleteRetentionRuleRequest {
    registryId: string;
    retentionRuleId: number;
}

export interface DeleteRobotRequest {
    registryId: string;
    UNKNOWN_PARAMETER_NAME: ;
}

export interface ExecuteRetentionPolicyOperationRequest {
    registryId: string;
    executeRetentionPolicyRequest?: ExecuteRetentionPolicyRequest;
}

export interface ListRegistryRepositoriesRequest {
    registryId: string;
}

export interface ListRegistryRepositoryArtifactsRequest {
    registryId: string;
    repositoryImage: string;
}

export interface ListRegistryRobotsRequest {
    registryId: string;
}

export interface ListReplicationsRequest {
    registryId: string;
}

export interface ListRetentionRulesRequest {
    registryId: string;
}

export interface ReadRegistryRequest {
    registryId: string;
}

export interface ReadRegistryRepositoryRequest {
    registryId: string;
    repositoryImage: string;
}

export interface ReadReplicationRequest {
    registryId: string;
    UNKNOWN_PARAMETER_NAME?: ;
}

export interface ReadRetentionRuleRequest {
    registryId: string;
    retentionRuleId: number;
}

export interface RegistryRegistryIdRepositoryRepositoryImageArtifactArtifactDigestDeleteRequest {
    registryId: string;
    repositoryImage: string;
    UNKNOWN_PARAMETER_NAME: ;
}

export interface RegistryRegistryIdRepositoryRepositoryImageArtifactArtifactDigestGetRequest {
    registryId: string;
    repositoryImage: string;
    UNKNOWN_PARAMETER_NAME: ;
}

export interface RegistryRegistryIdRobotRobotNameGetRequest {
    registryId: string;
    UNKNOWN_PARAMETER_NAME: ;
}

export interface UpdateContainerRegistryPasswordOperationRequest {
    registryId: string;
    updateContainerRegistryPasswordRequest?: UpdateContainerRegistryPasswordRequest;
}

export interface UpdateRegistryOperationRequest {
    registryId: string;
    updateRegistryRequest?: UpdateRegistryRequest;
}

export interface UpdateRepositoryOperationRequest {
    registryId: string;
    repositoryImage: string;
    updateRepositoryRequest?: UpdateRepositoryRequest;
}

export interface UpdateRetentionRuleOperationRequest {
    registryId: string;
    retentionRuleId: number;
    updateRetentionRuleRequest?: UpdateRetentionRuleRequest;
}

export interface UpdateRetentionScheduleOperationRequest {
    registryId: string;
    updateRetentionScheduleRequest?: UpdateRetentionScheduleRequest;
}

export interface UpdateRobotOperationRequest {
    registryId: string;
    UNKNOWN_PARAMETER_NAME: ;
    updateRobotRequest?: UpdateRobotRequest;
}

/**
 * 
 */
export class ContainerRegistryApi extends runtime.BaseAPI {

    /**
     * Create a new Container Registry Subscription
     * Create Container Registry
     */
    async createRegistryRaw(requestParameters: CreateRegistryOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Registry>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry`;

        const response = await this.request({
            path: urlPath,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: CreateRegistryRequestToJSON(requestParameters['createRegistryRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => RegistryFromJSON(jsonValue));
    }

    /**
     * Create a new Container Registry Subscription
     * Create Container Registry
     */
    async createRegistry(createRegistryRequest?: CreateRegistryRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Registry> {
        const response = await this.createRegistryRaw({ createRegistryRequest: createRegistryRequest }, initOverrides);
        return await response.value();
    }

    /**
     * Create a fresh set of Docker Credentials for this Container Registry Subscription
     * Create Docker Credentials
     */
    async createRegistryDockerCredentialsRaw(requestParameters: CreateRegistryDockerCredentialsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<RegistryDockerCredentials>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling createRegistryDockerCredentials().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['expirySeconds'] != null) {
            queryParameters['expiry_seconds'] = requestParameters['expirySeconds'];
        }

        if (requestParameters['readWrite'] != null) {
            queryParameters['read_write'] = requestParameters['readWrite'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/docker-credentials?expiry_seconds=0&read_write=false`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));

        const response = await this.request({
            path: urlPath,
            method: 'OPTIONS',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => RegistryDockerCredentialsFromJSON(jsonValue));
    }

    /**
     * Create a fresh set of Docker Credentials for this Container Registry Subscription
     * Create Docker Credentials
     */
    async createRegistryDockerCredentials(registryId: string, expirySeconds?: number, readWrite?: boolean, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<RegistryDockerCredentials> {
        const response = await this.createRegistryDockerCredentialsRaw({ registryId: registryId, expirySeconds: expirySeconds, readWrite: readWrite }, initOverrides);
        return await response.value();
    }

    /**
     * Create a fresh set of Docker Credentials for this Container Registry Subscription and return them in a Kubernetes friendly YAML format
     * Create Docker Credentials for Kubernetes
     */
    async createRegistryKubernetesDockerCredentialsRaw(requestParameters: CreateRegistryKubernetesDockerCredentialsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<RegistryKubernetesDockerCredentials>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling createRegistryKubernetesDockerCredentials().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['expirySeconds'] != null) {
            queryParameters['expiry_seconds'] = requestParameters['expirySeconds'];
        }

        if (requestParameters['readWrite'] != null) {
            queryParameters['read_write'] = requestParameters['readWrite'];
        }

        if (requestParameters['base64Encode'] != null) {
            queryParameters['base64_encode'] = requestParameters['base64Encode'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/docker-credentials/kubernetes?expiry_seconds=0&read_write=false&base64_encode=false`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));

        const response = await this.request({
            path: urlPath,
            method: 'OPTIONS',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => RegistryKubernetesDockerCredentialsFromJSON(jsonValue));
    }

    /**
     * Create a fresh set of Docker Credentials for this Container Registry Subscription and return them in a Kubernetes friendly YAML format
     * Create Docker Credentials for Kubernetes
     */
    async createRegistryKubernetesDockerCredentials(registryId: string, expirySeconds?: number, readWrite?: boolean, base64Encode?: boolean, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<RegistryKubernetesDockerCredentials> {
        const response = await this.createRegistryKubernetesDockerCredentialsRaw({ registryId: registryId, expirySeconds: expirySeconds, readWrite: readWrite, base64Encode: base64Encode }, initOverrides);
        return await response.value();
    }

    /**
     * Create a new Replication Policy for a Container Registry Subscription
     * Create Replication Policy
     */
    async createReplicationRaw(requestParameters: CreateReplicationOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Replication>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling createReplication().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/replication`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));

        const response = await this.request({
            path: urlPath,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: CreateReplicationRequestToJSON(requestParameters['createReplicationRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ReplicationFromJSON(jsonValue));
    }

    /**
     * Create a new Replication Policy for a Container Registry Subscription
     * Create Replication Policy
     */
    async createReplication(registryId: string, createReplicationRequest?: CreateReplicationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Replication> {
        const response = await this.createReplicationRaw({ registryId: registryId, createReplicationRequest: createReplicationRequest }, initOverrides);
        return await response.value();
    }

    /**
     * Create a new Retention Rule for a Container Regsitry Subscription
     * Create Retention Rule
     */
    async createRetentionRuleRaw(requestParameters: CreateRetentionRuleOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<RetentionRule>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling createRetentionRule().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/retention/rules`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));

        const response = await this.request({
            path: urlPath,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: CreateRetentionRuleRequestToJSON(requestParameters['createRetentionRuleRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => RetentionRuleFromJSON(jsonValue));
    }

    /**
     * Create a new Retention Rule for a Container Regsitry Subscription
     * Create Retention Rule
     */
    async createRetentionRule(registryId: string, createRetentionRuleRequest?: CreateRetentionRuleRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<RetentionRule> {
        const response = await this.createRetentionRuleRaw({ registryId: registryId, createRetentionRuleRequest: createRetentionRuleRequest }, initOverrides);
        return await response.value();
    }

    /**
     * Deletes a Container Registry Subscription
     * Delete Container Registry
     */
    async deleteRegistryRaw(requestParameters: DeleteRegistryRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling deleteRegistry().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));

        const response = await this.request({
            path: urlPath,
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Deletes a Container Registry Subscription
     * Delete Container Registry
     */
    async deleteRegistry(registryId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.deleteRegistryRaw({ registryId: registryId }, initOverrides);
    }

    /**
     * Deletes a Replication Policy from a Container Registry Subscription
     * Delete Replication Policy
     */
    async deleteReplicationRaw(requestParameters: DeleteReplicationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling deleteReplication().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/replication/{region}`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));

        const response = await this.request({
            path: urlPath,
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Deletes a Replication Policy from a Container Registry Subscription
     * Delete Replication Policy
     */
    async deleteReplication(registryId: string, UNKNOWN_PARAMETER_NAME?: , initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.deleteReplicationRaw({ registryId: registryId, UNKNOWN_PARAMETER_NAME: UNKNOWN_PARAMETER_NAME }, initOverrides);
    }

    /**
     * Deletes a Repository from a Container Registry Subscription
     * Delete Repository
     */
    async deleteRepositoryRaw(requestParameters: DeleteRepositoryRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling deleteRepository().'
            );
        }

        if (requestParameters['repositoryImage'] == null) {
            throw new runtime.RequiredError(
                'repositoryImage',
                'Required parameter "repositoryImage" was null or undefined when calling deleteRepository().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/repository/{repository-image}`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));
        urlPath = urlPath.replace(`{${"repository-image"}}`, encodeURIComponent(String(requestParameters['repositoryImage'])));

        const response = await this.request({
            path: urlPath,
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Deletes a Repository from a Container Registry Subscription
     * Delete Repository
     */
    async deleteRepository(registryId: string, repositoryImage: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.deleteRepositoryRaw({ registryId: registryId, repositoryImage: repositoryImage }, initOverrides);
    }

    /**
     * Deletes a Retention Rule from a Container Registry Subscription
     * Delete Retention Rule
     */
    async deleteRetentionRuleRaw(requestParameters: DeleteRetentionRuleRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling deleteRetentionRule().'
            );
        }

        if (requestParameters['retentionRuleId'] == null) {
            throw new runtime.RequiredError(
                'retentionRuleId',
                'Required parameter "retentionRuleId" was null or undefined when calling deleteRetentionRule().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/retention/rules/{retention-rule-id}`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));
        urlPath = urlPath.replace(`{${"retention-rule-id"}}`, encodeURIComponent(String(requestParameters['retentionRuleId'])));

        const response = await this.request({
            path: urlPath,
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Deletes a Retention Rule from a Container Registry Subscription
     * Delete Retention Rule
     */
    async deleteRetentionRule(registryId: string, retentionRuleId: number, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.deleteRetentionRuleRaw({ registryId: registryId, retentionRuleId: retentionRuleId }, initOverrides);
    }

    /**
     * Deletes a Robot from a Container Registry Subscription
     * Delete Robot
     */
    async deleteRobotRaw(requestParameters: DeleteRobotRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling deleteRobot().'
            );
        }

        if (requestParameters['UNKNOWN_PARAMETER_NAME'] == null) {
            throw new runtime.RequiredError(
                'UNKNOWN_PARAMETER_NAME',
                'Required parameter "UNKNOWN_PARAMETER_NAME" was null or undefined when calling deleteRobot().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/robot/{robot-name}`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));
        urlPath = urlPath.replace(`{${"robot-name"}}`, encodeURIComponent(String(requestParameters['UNKNOWN_PARAMETER_NAME'])));

        const response = await this.request({
            path: urlPath,
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Deletes a Robot from a Container Registry Subscription
     * Delete Robot
     */
    async deleteRobot(registryId: string, UNKNOWN_PARAMETER_NAME: , initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.deleteRobotRaw({ registryId: registryId, UNKNOWN_PARAMETER_NAME: UNKNOWN_PARAMETER_NAME }, initOverrides);
    }

    /**
     * Manually initiate the execution of a Retention Policy in a Container Registry Subscription
     * Trigger Retention Policy Execution
     */
    async executeRetentionPolicyRaw(requestParameters: ExecuteRetentionPolicyOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ExecuteRetentionPolicy201Response>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling executeRetentionPolicy().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/retention/executions`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));

        const response = await this.request({
            path: urlPath,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ExecuteRetentionPolicyRequestToJSON(requestParameters['executeRetentionPolicyRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ExecuteRetentionPolicy201ResponseFromJSON(jsonValue));
    }

    /**
     * Manually initiate the execution of a Retention Policy in a Container Registry Subscription
     * Trigger Retention Policy Execution
     */
    async executeRetentionPolicy(registryId: string, executeRetentionPolicyRequest?: ExecuteRetentionPolicyRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ExecuteRetentionPolicy201Response> {
        const response = await this.executeRetentionPolicyRaw({ registryId: registryId, executeRetentionPolicyRequest: executeRetentionPolicyRequest }, initOverrides);
        return await response.value();
    }

    /**
     * List All Container Registry Subscriptions for this account
     * List Container Registries
     */
    async listRegistriesRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ListRegistries200Response>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registries`;

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ListRegistries200ResponseFromJSON(jsonValue));
    }

    /**
     * List All Container Registry Subscriptions for this account
     * List Container Registries
     */
    async listRegistries(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ListRegistries200Response> {
        const response = await this.listRegistriesRaw(initOverrides);
        return await response.value();
    }

    /**
     * List All Plans to help choose which one is the best fit for your Container Registry
     * List Registry Plans
     */
    async listRegistryPlansRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ListRegistryPlans200Response>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/plan/list`;

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ListRegistryPlans200ResponseFromJSON(jsonValue));
    }

    /**
     * List All Plans to help choose which one is the best fit for your Container Registry
     * List Registry Plans
     */
    async listRegistryPlans(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ListRegistryPlans200Response> {
        const response = await this.listRegistryPlansRaw(initOverrides);
        return await response.value();
    }

    /**
     * List All Regions where a Container Registry can be deployed
     * List Registry Regions
     */
    async listRegistryRegionsRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ListRegistryRegions200Response>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/region/list`;

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ListRegistryRegions200ResponseFromJSON(jsonValue));
    }

    /**
     * List All Regions where a Container Registry can be deployed
     * List Registry Regions
     */
    async listRegistryRegions(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ListRegistryRegions200Response> {
        const response = await this.listRegistryRegionsRaw(initOverrides);
        return await response.value();
    }

    /**
     * List All Repositories in a Container Registry Subscription
     * List Repositories
     */
    async listRegistryRepositoriesRaw(requestParameters: ListRegistryRepositoriesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ListRegistryRepositories200Response>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling listRegistryRepositories().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/repositories`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ListRegistryRepositories200ResponseFromJSON(jsonValue));
    }

    /**
     * List All Repositories in a Container Registry Subscription
     * List Repositories
     */
    async listRegistryRepositories(registryId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ListRegistryRepositories200Response> {
        const response = await this.listRegistryRepositoriesRaw({ registryId: registryId }, initOverrides);
        return await response.value();
    }

    /**
     * List All Artifacts in a Container Registry Repository
     * List Artifacts
     */
    async listRegistryRepositoryArtifactsRaw(requestParameters: ListRegistryRepositoryArtifactsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ListRegistryRepositoryArtifacts200Response>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling listRegistryRepositoryArtifacts().'
            );
        }

        if (requestParameters['repositoryImage'] == null) {
            throw new runtime.RequiredError(
                'repositoryImage',
                'Required parameter "repositoryImage" was null or undefined when calling listRegistryRepositoryArtifacts().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/repository/{repository-image}/artifacts`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));
        urlPath = urlPath.replace(`{${"repository-image"}}`, encodeURIComponent(String(requestParameters['repositoryImage'])));

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ListRegistryRepositoryArtifacts200ResponseFromJSON(jsonValue));
    }

    /**
     * List All Artifacts in a Container Registry Repository
     * List Artifacts
     */
    async listRegistryRepositoryArtifacts(registryId: string, repositoryImage: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ListRegistryRepositoryArtifacts200Response> {
        const response = await this.listRegistryRepositoryArtifactsRaw({ registryId: registryId, repositoryImage: repositoryImage }, initOverrides);
        return await response.value();
    }

    /**
     * List All Robots in a Conainer Registry Subscription
     * List Robots
     */
    async listRegistryRobotsRaw(requestParameters: ListRegistryRobotsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ListRegistryRobots200Response>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling listRegistryRobots().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/robots`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ListRegistryRobots200ResponseFromJSON(jsonValue));
    }

    /**
     * List All Robots in a Conainer Registry Subscription
     * List Robots
     */
    async listRegistryRobots(registryId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ListRegistryRobots200Response> {
        const response = await this.listRegistryRobotsRaw({ registryId: registryId }, initOverrides);
        return await response.value();
    }

    /**
     * List All Replication Policies in a Container Registry Subscription
     * List Replication Policies
     */
    async listReplicationsRaw(requestParameters: ListReplicationsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ListReplications200Response>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling listReplications().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/replications`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ListReplications200ResponseFromJSON(jsonValue));
    }

    /**
     * List All Replication Policies in a Container Registry Subscription
     * List Replication Policies
     */
    async listReplications(registryId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ListReplications200Response> {
        const response = await this.listReplicationsRaw({ registryId: registryId }, initOverrides);
        return await response.value();
    }

    /**
     * List all Retention Rules for a Container Registry Subscription
     * List Retention Rules
     */
    async listRetentionRulesRaw(requestParameters: ListRetentionRulesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ListRetentionRules200Response>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling listRetentionRules().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/retention/rules`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ListRetentionRules200ResponseFromJSON(jsonValue));
    }

    /**
     * List all Retention Rules for a Container Registry Subscription
     * List Retention Rules
     */
    async listRetentionRules(registryId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ListRetentionRules200Response> {
        const response = await this.listRetentionRulesRaw({ registryId: registryId }, initOverrides);
        return await response.value();
    }

    /**
     * Get a single Container Registry Subscription
     * Read Container Registry
     */
    async readRegistryRaw(requestParameters: ReadRegistryRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Registry>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling readRegistry().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => RegistryFromJSON(jsonValue));
    }

    /**
     * Get a single Container Registry Subscription
     * Read Container Registry
     */
    async readRegistry(registryId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Registry> {
        const response = await this.readRegistryRaw({ registryId: registryId }, initOverrides);
        return await response.value();
    }

    /**
     * Get a single Repository in a Container Registry Subscription
     * Read Repository
     */
    async readRegistryRepositoryRaw(requestParameters: ReadRegistryRepositoryRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<RegistryRepository>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling readRegistryRepository().'
            );
        }

        if (requestParameters['repositoryImage'] == null) {
            throw new runtime.RequiredError(
                'repositoryImage',
                'Required parameter "repositoryImage" was null or undefined when calling readRegistryRepository().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/repository/{repository-image}`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));
        urlPath = urlPath.replace(`{${"repository-image"}}`, encodeURIComponent(String(requestParameters['repositoryImage'])));

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => RegistryRepositoryFromJSON(jsonValue));
    }

    /**
     * Get a single Repository in a Container Registry Subscription
     * Read Repository
     */
    async readRegistryRepository(registryId: string, repositoryImage: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<RegistryRepository> {
        const response = await this.readRegistryRepositoryRaw({ registryId: registryId, repositoryImage: repositoryImage }, initOverrides);
        return await response.value();
    }

    /**
     * Get a single Replication Policy in a Container Registry Subscription
     * Read Replication Policy
     */
    async readReplicationRaw(requestParameters: ReadReplicationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Replication>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling readReplication().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/replication/{region}`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ReplicationFromJSON(jsonValue));
    }

    /**
     * Get a single Replication Policy in a Container Registry Subscription
     * Read Replication Policy
     */
    async readReplication(registryId: string, UNKNOWN_PARAMETER_NAME?: , initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Replication> {
        const response = await this.readReplicationRaw({ registryId: registryId, UNKNOWN_PARAMETER_NAME: UNKNOWN_PARAMETER_NAME }, initOverrides);
        return await response.value();
    }

    /**
     * Get a single Retention Rule in a Container Registry Subscription
     * Read Retention Rule
     */
    async readRetentionRuleRaw(requestParameters: ReadRetentionRuleRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<RetentionRule>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling readRetentionRule().'
            );
        }

        if (requestParameters['retentionRuleId'] == null) {
            throw new runtime.RequiredError(
                'retentionRuleId',
                'Required parameter "retentionRuleId" was null or undefined when calling readRetentionRule().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/retention/rules/{retention-rule-id}`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));
        urlPath = urlPath.replace(`{${"retention-rule-id"}}`, encodeURIComponent(String(requestParameters['retentionRuleId'])));

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => RetentionRuleFromJSON(jsonValue));
    }

    /**
     * Get a single Retention Rule in a Container Registry Subscription
     * Read Retention Rule
     */
    async readRetentionRule(registryId: string, retentionRuleId: number, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<RetentionRule> {
        const response = await this.readRetentionRuleRaw({ registryId: registryId, retentionRuleId: retentionRuleId }, initOverrides);
        return await response.value();
    }

    /**
     * Deletes an Artifact from a Container Registry Repository
     * Delete Artifact
     */
    async registryRegistryIdRepositoryRepositoryImageArtifactArtifactDigestDeleteRaw(requestParameters: RegistryRegistryIdRepositoryRepositoryImageArtifactArtifactDigestDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling registryRegistryIdRepositoryRepositoryImageArtifactArtifactDigestDelete().'
            );
        }

        if (requestParameters['repositoryImage'] == null) {
            throw new runtime.RequiredError(
                'repositoryImage',
                'Required parameter "repositoryImage" was null or undefined when calling registryRegistryIdRepositoryRepositoryImageArtifactArtifactDigestDelete().'
            );
        }

        if (requestParameters['UNKNOWN_PARAMETER_NAME'] == null) {
            throw new runtime.RequiredError(
                'UNKNOWN_PARAMETER_NAME',
                'Required parameter "UNKNOWN_PARAMETER_NAME" was null or undefined when calling registryRegistryIdRepositoryRepositoryImageArtifactArtifactDigestDelete().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/repository/{repository-image}/artifact/{artifact-digest}`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));
        urlPath = urlPath.replace(`{${"repository-image"}}`, encodeURIComponent(String(requestParameters['repositoryImage'])));
        urlPath = urlPath.replace(`{${"artifact-digest"}}`, encodeURIComponent(String(requestParameters['UNKNOWN_PARAMETER_NAME'])));

        const response = await this.request({
            path: urlPath,
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Deletes an Artifact from a Container Registry Repository
     * Delete Artifact
     */
    async registryRegistryIdRepositoryRepositoryImageArtifactArtifactDigestDelete(registryId: string, repositoryImage: string, UNKNOWN_PARAMETER_NAME: , initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.registryRegistryIdRepositoryRepositoryImageArtifactArtifactDigestDeleteRaw({ registryId: registryId, repositoryImage: repositoryImage, UNKNOWN_PARAMETER_NAME: UNKNOWN_PARAMETER_NAME }, initOverrides);
    }

    /**
     * Get a single Artifact in a Container Registry Repository
     * Read Artifact
     */
    async registryRegistryIdRepositoryRepositoryImageArtifactArtifactDigestGetRaw(requestParameters: RegistryRegistryIdRepositoryRepositoryImageArtifactArtifactDigestGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<RegistryRepositoryArtifact>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling registryRegistryIdRepositoryRepositoryImageArtifactArtifactDigestGet().'
            );
        }

        if (requestParameters['repositoryImage'] == null) {
            throw new runtime.RequiredError(
                'repositoryImage',
                'Required parameter "repositoryImage" was null or undefined when calling registryRegistryIdRepositoryRepositoryImageArtifactArtifactDigestGet().'
            );
        }

        if (requestParameters['UNKNOWN_PARAMETER_NAME'] == null) {
            throw new runtime.RequiredError(
                'UNKNOWN_PARAMETER_NAME',
                'Required parameter "UNKNOWN_PARAMETER_NAME" was null or undefined when calling registryRegistryIdRepositoryRepositoryImageArtifactArtifactDigestGet().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/repository/{repository-image}/artifact/{artifact-digest}`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));
        urlPath = urlPath.replace(`{${"repository-image"}}`, encodeURIComponent(String(requestParameters['repositoryImage'])));
        urlPath = urlPath.replace(`{${"artifact-digest"}}`, encodeURIComponent(String(requestParameters['UNKNOWN_PARAMETER_NAME'])));

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => RegistryRepositoryArtifactFromJSON(jsonValue));
    }

    /**
     * Get a single Artifact in a Container Registry Repository
     * Read Artifact
     */
    async registryRegistryIdRepositoryRepositoryImageArtifactArtifactDigestGet(registryId: string, repositoryImage: string, UNKNOWN_PARAMETER_NAME: , initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<RegistryRepositoryArtifact> {
        const response = await this.registryRegistryIdRepositoryRepositoryImageArtifactArtifactDigestGetRaw({ registryId: registryId, repositoryImage: repositoryImage, UNKNOWN_PARAMETER_NAME: UNKNOWN_PARAMETER_NAME }, initOverrides);
        return await response.value();
    }

    /**
     * Get a single Robot in a Container Registry Subscription
     * Read Robot
     */
    async registryRegistryIdRobotRobotNameGetRaw(requestParameters: RegistryRegistryIdRobotRobotNameGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<RegistryRobot>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling registryRegistryIdRobotRobotNameGet().'
            );
        }

        if (requestParameters['UNKNOWN_PARAMETER_NAME'] == null) {
            throw new runtime.RequiredError(
                'UNKNOWN_PARAMETER_NAME',
                'Required parameter "UNKNOWN_PARAMETER_NAME" was null or undefined when calling registryRegistryIdRobotRobotNameGet().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/robot/{robot-name}`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));
        urlPath = urlPath.replace(`{${"robot-name"}}`, encodeURIComponent(String(requestParameters['UNKNOWN_PARAMETER_NAME'])));

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => RegistryRobotFromJSON(jsonValue));
    }

    /**
     * Get a single Robot in a Container Registry Subscription
     * Read Robot
     */
    async registryRegistryIdRobotRobotNameGet(registryId: string, UNKNOWN_PARAMETER_NAME: , initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<RegistryRobot> {
        const response = await this.registryRegistryIdRobotRobotNameGetRaw({ registryId: registryId, UNKNOWN_PARAMETER_NAME: UNKNOWN_PARAMETER_NAME }, initOverrides);
        return await response.value();
    }

    /**
     * Update the Container Registy Password for this Container Registry Subscription
     * Update Container Registry Password
     */
    async updateContainerRegistryPasswordRaw(requestParameters: UpdateContainerRegistryPasswordOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UpdateContainerRegistryPassword200Response>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling updateContainerRegistryPassword().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/user/password`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));

        const response = await this.request({
            path: urlPath,
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: UpdateContainerRegistryPasswordRequestToJSON(requestParameters['updateContainerRegistryPasswordRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UpdateContainerRegistryPassword200ResponseFromJSON(jsonValue));
    }

    /**
     * Update the Container Registy Password for this Container Registry Subscription
     * Update Container Registry Password
     */
    async updateContainerRegistryPassword(registryId: string, updateContainerRegistryPasswordRequest?: UpdateContainerRegistryPasswordRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UpdateContainerRegistryPassword200Response> {
        const response = await this.updateContainerRegistryPasswordRaw({ registryId: registryId, updateContainerRegistryPasswordRequest: updateContainerRegistryPasswordRequest }, initOverrides);
        return await response.value();
    }

    /**
     * Update a Container Registry Subscription
     * Update Container Registry
     */
    async updateRegistryRaw(requestParameters: UpdateRegistryOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Registry>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling updateRegistry().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));

        const response = await this.request({
            path: urlPath,
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: UpdateRegistryRequestToJSON(requestParameters['updateRegistryRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => RegistryFromJSON(jsonValue));
    }

    /**
     * Update a Container Registry Subscription
     * Update Container Registry
     */
    async updateRegistry(registryId: string, updateRegistryRequest?: UpdateRegistryRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Registry> {
        const response = await this.updateRegistryRaw({ registryId: registryId, updateRegistryRequest: updateRegistryRequest }, initOverrides);
        return await response.value();
    }

    /**
     * Update a Repository in a Container Registry Subscription
     * Update Repository
     */
    async updateRepositoryRaw(requestParameters: UpdateRepositoryOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<RegistryRepository>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling updateRepository().'
            );
        }

        if (requestParameters['repositoryImage'] == null) {
            throw new runtime.RequiredError(
                'repositoryImage',
                'Required parameter "repositoryImage" was null or undefined when calling updateRepository().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/repository/{repository-image}`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));
        urlPath = urlPath.replace(`{${"repository-image"}}`, encodeURIComponent(String(requestParameters['repositoryImage'])));

        const response = await this.request({
            path: urlPath,
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: UpdateRepositoryRequestToJSON(requestParameters['updateRepositoryRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => RegistryRepositoryFromJSON(jsonValue));
    }

    /**
     * Update a Repository in a Container Registry Subscription
     * Update Repository
     */
    async updateRepository(registryId: string, repositoryImage: string, updateRepositoryRequest?: UpdateRepositoryRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<RegistryRepository> {
        const response = await this.updateRepositoryRaw({ registryId: registryId, repositoryImage: repositoryImage, updateRepositoryRequest: updateRepositoryRequest }, initOverrides);
        return await response.value();
    }

    /**
     * Update a Retention Rule in a Container Registry Subscription
     * Update Retention Rule
     */
    async updateRetentionRuleRaw(requestParameters: UpdateRetentionRuleOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<RetentionRule>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling updateRetentionRule().'
            );
        }

        if (requestParameters['retentionRuleId'] == null) {
            throw new runtime.RequiredError(
                'retentionRuleId',
                'Required parameter "retentionRuleId" was null or undefined when calling updateRetentionRule().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/retention/rules/{retention-rule-id}`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));
        urlPath = urlPath.replace(`{${"retention-rule-id"}}`, encodeURIComponent(String(requestParameters['retentionRuleId'])));

        const response = await this.request({
            path: urlPath,
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: UpdateRetentionRuleRequestToJSON(requestParameters['updateRetentionRuleRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => RetentionRuleFromJSON(jsonValue));
    }

    /**
     * Update a Retention Rule in a Container Registry Subscription
     * Update Retention Rule
     */
    async updateRetentionRule(registryId: string, retentionRuleId: number, updateRetentionRuleRequest?: UpdateRetentionRuleRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<RetentionRule> {
        const response = await this.updateRetentionRuleRaw({ registryId: registryId, retentionRuleId: retentionRuleId, updateRetentionRuleRequest: updateRetentionRuleRequest }, initOverrides);
        return await response.value();
    }

    /**
     * Update when a Retention Policy is scheduled to run in a Container Registry Subscription
     * Update Retention Policy Schedule
     */
    async updateRetentionScheduleRaw(requestParameters: UpdateRetentionScheduleOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UpdateRetentionSchedule200Response>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling updateRetentionSchedule().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/retention/schedule`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));

        const response = await this.request({
            path: urlPath,
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: UpdateRetentionScheduleRequestToJSON(requestParameters['updateRetentionScheduleRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UpdateRetentionSchedule200ResponseFromJSON(jsonValue));
    }

    /**
     * Update when a Retention Policy is scheduled to run in a Container Registry Subscription
     * Update Retention Policy Schedule
     */
    async updateRetentionSchedule(registryId: string, updateRetentionScheduleRequest?: UpdateRetentionScheduleRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UpdateRetentionSchedule200Response> {
        const response = await this.updateRetentionScheduleRaw({ registryId: registryId, updateRetentionScheduleRequest: updateRetentionScheduleRequest }, initOverrides);
        return await response.value();
    }

    /**
     * Update the description, disable, duration, and add or remove access, in a Container Registry Subscription Robot
     * Update Robot
     */
    async updateRobotRaw(requestParameters: UpdateRobotOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<RegistryRobot>> {
        if (requestParameters['registryId'] == null) {
            throw new runtime.RequiredError(
                'registryId',
                'Required parameter "registryId" was null or undefined when calling updateRobot().'
            );
        }

        if (requestParameters['UNKNOWN_PARAMETER_NAME'] == null) {
            throw new runtime.RequiredError(
                'UNKNOWN_PARAMETER_NAME',
                'Required parameter "UNKNOWN_PARAMETER_NAME" was null or undefined when calling updateRobot().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("API Key", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/registry/{registry-id}/robot/{robot-name}`;
        urlPath = urlPath.replace(`{${"registry-id"}}`, encodeURIComponent(String(requestParameters['registryId'])));
        urlPath = urlPath.replace(`{${"robot-name"}}`, encodeURIComponent(String(requestParameters['UNKNOWN_PARAMETER_NAME'])));

        const response = await this.request({
            path: urlPath,
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: UpdateRobotRequestToJSON(requestParameters['updateRobotRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => RegistryRobotFromJSON(jsonValue));
    }

    /**
     * Update the description, disable, duration, and add or remove access, in a Container Registry Subscription Robot
     * Update Robot
     */
    async updateRobot(registryId: string, UNKNOWN_PARAMETER_NAME: , updateRobotRequest?: UpdateRobotRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<RegistryRobot> {
        const response = await this.updateRobotRaw({ registryId: registryId, UNKNOWN_PARAMETER_NAME: UNKNOWN_PARAMETER_NAME, updateRobotRequest: updateRobotRequest }, initOverrides);
        return await response.value();
    }

}
