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
  CreateKubernetesCluster201Response,
  CreateKubernetesClusterRequest,
  CreateNodepools201Response,
  CreateNodepoolsRequest,
  GetKubernetesAvailableUpgrades200Response,
  GetKubernetesClustersConfig200Response,
  GetKubernetesResources200Response,
  GetKubernetesVersions200Response,
  GetNodepools200Response,
  ListKubernetesClusters200Response,
  StartKubernetesClusterUpgradeRequest,
  UpdateKubernetesClusterRequest,
  UpdateNodepoolRequest,
  UpdateNodepoolRequest1,
} from '../models/index';
import {
  CreateKubernetesCluster201ResponseFromJSON,
  CreateKubernetesCluster201ResponseToJSON,
  CreateKubernetesClusterRequestFromJSON,
  CreateKubernetesClusterRequestToJSON,
  CreateNodepools201ResponseFromJSON,
  CreateNodepools201ResponseToJSON,
  CreateNodepoolsRequestFromJSON,
  CreateNodepoolsRequestToJSON,
  GetKubernetesAvailableUpgrades200ResponseFromJSON,
  GetKubernetesAvailableUpgrades200ResponseToJSON,
  GetKubernetesClustersConfig200ResponseFromJSON,
  GetKubernetesClustersConfig200ResponseToJSON,
  GetKubernetesResources200ResponseFromJSON,
  GetKubernetesResources200ResponseToJSON,
  GetKubernetesVersions200ResponseFromJSON,
  GetKubernetesVersions200ResponseToJSON,
  GetNodepools200ResponseFromJSON,
  GetNodepools200ResponseToJSON,
  ListKubernetesClusters200ResponseFromJSON,
  ListKubernetesClusters200ResponseToJSON,
  StartKubernetesClusterUpgradeRequestFromJSON,
  StartKubernetesClusterUpgradeRequestToJSON,
  UpdateKubernetesClusterRequestFromJSON,
  UpdateKubernetesClusterRequestToJSON,
  UpdateNodepoolRequestFromJSON,
  UpdateNodepoolRequestToJSON,
  UpdateNodepoolRequest1FromJSON,
  UpdateNodepoolRequest1ToJSON,
} from '../models/index';

export interface CreateKubernetesClusterOperationRequest {
  createKubernetesClusterRequest?: CreateKubernetesClusterRequest;
}

export interface CreateNodepoolsOperationRequest {
  vkeId: string;
  createNodepoolsRequest?: CreateNodepoolsRequest;
}

export interface DeleteKubernetesClusterRequest {
  vkeId: string;
}

export interface DeleteKubernetesClusterVkeIdDeleteWithLinkedResourcesRequest {
  vkeId: string;
}

export interface DeleteNodepoolRequest {
  vkeId: string;
  nodepoolId: string;
}

export interface DeleteNodepoolInstanceRequest {
  vkeId: string;
  nodepoolId: string;
  nodeId: string;
}

export interface GetKubernetesAvailableUpgradesRequest {
  vkeId: string;
}

export interface GetKubernetesClustersRequest {
  vkeId: string;
}

export interface GetKubernetesClustersConfigRequest {
  vkeId: string;
}

export interface GetKubernetesResourcesRequest {
  vkeId: string;
}

export interface GetNodepoolRequest {
  vkeId: string;
  nodepoolId: string;
}

export interface GetNodepoolsRequest {
  vkeId: string;
}

export interface RecycleNodepoolInstanceRequest {
  vkeId: string;
  nodepoolId: string;
  nodeId: string;
}

export interface StartKubernetesClusterUpgradeOperationRequest {
  vkeId: string;
  startKubernetesClusterUpgradeRequest?: StartKubernetesClusterUpgradeRequest;
}

export interface UpdateKubernetesClusterOperationRequest {
  vkeId: string;
  updateKubernetesClusterRequest?: UpdateKubernetesClusterRequest;
}

export interface UpdateNodepoolOperationRequest {
  vkeId: string;
  nodepoolId: string;
  updateNodepoolRequest?: UpdateNodepoolRequest;
}

/**
 *
 */
export class KubernetesApi extends runtime.BaseAPI {
  /**
   * Create Kubernetes Cluster
   * Create Kubernetes Cluster
   */
  async createKubernetesClusterRaw(
    requestParameters: CreateKubernetesClusterOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateKubernetesCluster201Response>> {
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

    let urlPath = `/kubernetes/clusters`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateKubernetesClusterRequestToJSON(requestParameters['createKubernetesClusterRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateKubernetesCluster201ResponseFromJSON(jsonValue));
  }

  /**
   * Create Kubernetes Cluster
   * Create Kubernetes Cluster
   */
  async createKubernetesCluster(
    createKubernetesClusterRequest?: CreateKubernetesClusterRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateKubernetesCluster201Response> {
    const response = await this.createKubernetesClusterRaw(
      { createKubernetesClusterRequest: createKubernetesClusterRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Create NodePool for a Existing Kubernetes Cluster
   * Create NodePool
   */
  async createNodepoolsRaw(
    requestParameters: CreateNodepoolsOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateNodepools201Response>> {
    if (requestParameters['vkeId'] == null) {
      throw new runtime.RequiredError('vkeId', 'Required parameter "vkeId" was null or undefined when calling createNodepools().');
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

    let urlPath = `/kubernetes/clusters/{vke-id}/node-pools`;
    urlPath = urlPath.replace(`{${'vke-id'}}`, encodeURIComponent(String(requestParameters['vkeId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateNodepoolsRequestToJSON(requestParameters['createNodepoolsRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateNodepools201ResponseFromJSON(jsonValue));
  }

  /**
   * Create NodePool for a Existing Kubernetes Cluster
   * Create NodePool
   */
  async createNodepools(
    vkeId: string,
    createNodepoolsRequest?: CreateNodepoolsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateNodepools201Response> {
    const response = await this.createNodepoolsRaw({ vkeId: vkeId, createNodepoolsRequest: createNodepoolsRequest }, initOverrides);
    return await response.value();
  }

  /**
   * Delete Kubernetes Cluster
   * Delete Kubernetes Cluster
   */
  async deleteKubernetesClusterRaw(
    requestParameters: DeleteKubernetesClusterRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['vkeId'] == null) {
      throw new runtime.RequiredError('vkeId', 'Required parameter "vkeId" was null or undefined when calling deleteKubernetesCluster().');
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

    let urlPath = `/kubernetes/clusters/{vke-id}`;
    urlPath = urlPath.replace(`{${'vke-id'}}`, encodeURIComponent(String(requestParameters['vkeId'])));

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
   * Delete Kubernetes Cluster
   * Delete Kubernetes Cluster
   */
  async deleteKubernetesCluster(vkeId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.deleteKubernetesClusterRaw({ vkeId: vkeId }, initOverrides);
  }

  /**
   * Delete Kubernetes Cluster and all related resources.
   * Delete VKE Cluster and All Related Resources
   */
  async deleteKubernetesClusterVkeIdDeleteWithLinkedResourcesRaw(
    requestParameters: DeleteKubernetesClusterVkeIdDeleteWithLinkedResourcesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['vkeId'] == null) {
      throw new runtime.RequiredError(
        'vkeId',
        'Required parameter "vkeId" was null or undefined when calling deleteKubernetesClusterVkeIdDeleteWithLinkedResources().',
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

    let urlPath = `/kubernetes/clusters/{vke-id}/delete-with-linked-resources`;
    urlPath = urlPath.replace(`{${'vke-id'}}`, encodeURIComponent(String(requestParameters['vkeId'])));

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
   * Delete Kubernetes Cluster and all related resources.
   * Delete VKE Cluster and All Related Resources
   */
  async deleteKubernetesClusterVkeIdDeleteWithLinkedResources(
    vkeId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.deleteKubernetesClusterVkeIdDeleteWithLinkedResourcesRaw({ vkeId: vkeId }, initOverrides);
  }

  /**
   * Delete a NodePool from a Kubernetes Cluster
   * Delete Nodepool
   */
  async deleteNodepoolRaw(
    requestParameters: DeleteNodepoolRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['vkeId'] == null) {
      throw new runtime.RequiredError('vkeId', 'Required parameter "vkeId" was null or undefined when calling deleteNodepool().');
    }

    if (requestParameters['nodepoolId'] == null) {
      throw new runtime.RequiredError('nodepoolId', 'Required parameter "nodepoolId" was null or undefined when calling deleteNodepool().');
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

    let urlPath = `/kubernetes/clusters/{vke-id}/node-pools/{nodepool-id}`;
    urlPath = urlPath.replace(`{${'vke-id'}}`, encodeURIComponent(String(requestParameters['vkeId'])));
    urlPath = urlPath.replace(`{${'nodepool-id'}}`, encodeURIComponent(String(requestParameters['nodepoolId'])));

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
   * Delete a NodePool from a Kubernetes Cluster
   * Delete Nodepool
   */
  async deleteNodepool(vkeId: string, nodepoolId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.deleteNodepoolRaw({ vkeId: vkeId, nodepoolId: nodepoolId }, initOverrides);
  }

  /**
   * Delete a single nodepool instance from a given Nodepool
   * Delete NodePool Instance
   */
  async deleteNodepoolInstanceRaw(
    requestParameters: DeleteNodepoolInstanceRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['vkeId'] == null) {
      throw new runtime.RequiredError('vkeId', 'Required parameter "vkeId" was null or undefined when calling deleteNodepoolInstance().');
    }

    if (requestParameters['nodepoolId'] == null) {
      throw new runtime.RequiredError(
        'nodepoolId',
        'Required parameter "nodepoolId" was null or undefined when calling deleteNodepoolInstance().',
      );
    }

    if (requestParameters['nodeId'] == null) {
      throw new runtime.RequiredError('nodeId', 'Required parameter "nodeId" was null or undefined when calling deleteNodepoolInstance().');
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

    let urlPath = `/kubernetes/clusters/{vke-id}/node-pools/{nodepool-id}/nodes/{node-id}`;
    urlPath = urlPath.replace(`{${'vke-id'}}`, encodeURIComponent(String(requestParameters['vkeId'])));
    urlPath = urlPath.replace(`{${'nodepool-id'}}`, encodeURIComponent(String(requestParameters['nodepoolId'])));
    urlPath = urlPath.replace(`{${'node-id'}}`, encodeURIComponent(String(requestParameters['nodeId'])));

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
   * Delete a single nodepool instance from a given Nodepool
   * Delete NodePool Instance
   */
  async deleteNodepoolInstance(
    vkeId: string,
    nodepoolId: string,
    nodeId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.deleteNodepoolInstanceRaw({ vkeId: vkeId, nodepoolId: nodepoolId, nodeId: nodeId }, initOverrides);
  }

  /**
   * Get the available upgrades for the specified Kubernetes cluster.
   * Get Kubernetes Available Upgrades
   */
  async getKubernetesAvailableUpgradesRaw(
    requestParameters: GetKubernetesAvailableUpgradesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetKubernetesAvailableUpgrades200Response>> {
    if (requestParameters['vkeId'] == null) {
      throw new runtime.RequiredError(
        'vkeId',
        'Required parameter "vkeId" was null or undefined when calling getKubernetesAvailableUpgrades().',
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

    let urlPath = `/kubernetes/clusters/{vke-id}/available-upgrades`;
    urlPath = urlPath.replace(`{${'vke-id'}}`, encodeURIComponent(String(requestParameters['vkeId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetKubernetesAvailableUpgrades200ResponseFromJSON(jsonValue));
  }

  /**
   * Get the available upgrades for the specified Kubernetes cluster.
   * Get Kubernetes Available Upgrades
   */
  async getKubernetesAvailableUpgrades(
    vkeId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetKubernetesAvailableUpgrades200Response> {
    const response = await this.getKubernetesAvailableUpgradesRaw({ vkeId: vkeId }, initOverrides);
    return await response.value();
  }

  /**
   * Get Kubernetes Cluster
   * Get Kubernetes Cluster
   */
  async getKubernetesClustersRaw(
    requestParameters: GetKubernetesClustersRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateKubernetesCluster201Response>> {
    if (requestParameters['vkeId'] == null) {
      throw new runtime.RequiredError('vkeId', 'Required parameter "vkeId" was null or undefined when calling getKubernetesClusters().');
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

    let urlPath = `/kubernetes/clusters/{vke-id}`;
    urlPath = urlPath.replace(`{${'vke-id'}}`, encodeURIComponent(String(requestParameters['vkeId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateKubernetesCluster201ResponseFromJSON(jsonValue));
  }

  /**
   * Get Kubernetes Cluster
   * Get Kubernetes Cluster
   */
  async getKubernetesClusters(
    vkeId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateKubernetesCluster201Response> {
    const response = await this.getKubernetesClustersRaw({ vkeId: vkeId }, initOverrides);
    return await response.value();
  }

  /**
   * Get Kubernetes Cluster Kubeconfig
   * Get Kubernetes Cluster Kubeconfig
   */
  async getKubernetesClustersConfigRaw(
    requestParameters: GetKubernetesClustersConfigRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetKubernetesClustersConfig200Response>> {
    if (requestParameters['vkeId'] == null) {
      throw new runtime.RequiredError(
        'vkeId',
        'Required parameter "vkeId" was null or undefined when calling getKubernetesClustersConfig().',
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

    let urlPath = `/kubernetes/clusters/{vke-id}/config`;
    urlPath = urlPath.replace(`{${'vke-id'}}`, encodeURIComponent(String(requestParameters['vkeId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetKubernetesClustersConfig200ResponseFromJSON(jsonValue));
  }

  /**
   * Get Kubernetes Cluster Kubeconfig
   * Get Kubernetes Cluster Kubeconfig
   */
  async getKubernetesClustersConfig(
    vkeId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetKubernetesClustersConfig200Response> {
    const response = await this.getKubernetesClustersConfigRaw({ vkeId: vkeId }, initOverrides);
    return await response.value();
  }

  /**
   * Get the block storage volumes and load balancers deployed by the specified Kubernetes cluster.
   * Get Kubernetes Resources
   */
  async getKubernetesResourcesRaw(
    requestParameters: GetKubernetesResourcesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetKubernetesResources200Response>> {
    if (requestParameters['vkeId'] == null) {
      throw new runtime.RequiredError('vkeId', 'Required parameter "vkeId" was null or undefined when calling getKubernetesResources().');
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

    let urlPath = `/kubernetes/clusters/{vke-id}/resources`;
    urlPath = urlPath.replace(`{${'vke-id'}}`, encodeURIComponent(String(requestParameters['vkeId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetKubernetesResources200ResponseFromJSON(jsonValue));
  }

  /**
   * Get the block storage volumes and load balancers deployed by the specified Kubernetes cluster.
   * Get Kubernetes Resources
   */
  async getKubernetesResources(
    vkeId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetKubernetesResources200Response> {
    const response = await this.getKubernetesResourcesRaw({ vkeId: vkeId }, initOverrides);
    return await response.value();
  }

  /**
   * Get a list of supported Kubernetes versions
   * Get Kubernetes Versions
   */
  async getKubernetesVersionsRaw(
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetKubernetesVersions200Response>> {
    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    let urlPath = `/kubernetes/versions`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetKubernetesVersions200ResponseFromJSON(jsonValue));
  }

  /**
   * Get a list of supported Kubernetes versions
   * Get Kubernetes Versions
   */
  async getKubernetesVersions(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetKubernetesVersions200Response> {
    const response = await this.getKubernetesVersionsRaw(initOverrides);
    return await response.value();
  }

  /**
   * Get Nodepool from a Kubernetes Cluster
   * Get NodePool
   */
  async getNodepoolRaw(
    requestParameters: GetNodepoolRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateNodepools201Response>> {
    if (requestParameters['vkeId'] == null) {
      throw new runtime.RequiredError('vkeId', 'Required parameter "vkeId" was null or undefined when calling getNodepool().');
    }

    if (requestParameters['nodepoolId'] == null) {
      throw new runtime.RequiredError('nodepoolId', 'Required parameter "nodepoolId" was null or undefined when calling getNodepool().');
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

    let urlPath = `/kubernetes/clusters/{vke-id}/node-pools/{nodepool-id}`;
    urlPath = urlPath.replace(`{${'vke-id'}}`, encodeURIComponent(String(requestParameters['vkeId'])));
    urlPath = urlPath.replace(`{${'nodepool-id'}}`, encodeURIComponent(String(requestParameters['nodepoolId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateNodepools201ResponseFromJSON(jsonValue));
  }

  /**
   * Get Nodepool from a Kubernetes Cluster
   * Get NodePool
   */
  async getNodepool(
    vkeId: string,
    nodepoolId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateNodepools201Response> {
    const response = await this.getNodepoolRaw({ vkeId: vkeId, nodepoolId: nodepoolId }, initOverrides);
    return await response.value();
  }

  /**
   * List all available NodePools on a Kubernetes Cluster
   * List NodePools
   */
  async getNodepoolsRaw(
    requestParameters: GetNodepoolsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetNodepools200Response>> {
    if (requestParameters['vkeId'] == null) {
      throw new runtime.RequiredError('vkeId', 'Required parameter "vkeId" was null or undefined when calling getNodepools().');
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

    let urlPath = `/kubernetes/clusters/{vke-id}/node-pools`;
    urlPath = urlPath.replace(`{${'vke-id'}}`, encodeURIComponent(String(requestParameters['vkeId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetNodepools200ResponseFromJSON(jsonValue));
  }

  /**
   * List all available NodePools on a Kubernetes Cluster
   * List NodePools
   */
  async getNodepools(vkeId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetNodepools200Response> {
    const response = await this.getNodepoolsRaw({ vkeId: vkeId }, initOverrides);
    return await response.value();
  }

  /**
   * List all Kubernetes clusters currently deployed
   * List all Kubernetes Clusters
   */
  async listKubernetesClustersRaw(
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListKubernetesClusters200Response>> {
    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/kubernetes/clusters`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListKubernetesClusters200ResponseFromJSON(jsonValue));
  }

  /**
   * List all Kubernetes clusters currently deployed
   * List all Kubernetes Clusters
   */
  async listKubernetesClusters(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ListKubernetesClusters200Response> {
    const response = await this.listKubernetesClustersRaw(initOverrides);
    return await response.value();
  }

  /**
   * Recycle a specific NodePool Instance
   * Recycle a NodePool Instance
   */
  async recycleNodepoolInstanceRaw(
    requestParameters: RecycleNodepoolInstanceRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['vkeId'] == null) {
      throw new runtime.RequiredError('vkeId', 'Required parameter "vkeId" was null or undefined when calling recycleNodepoolInstance().');
    }

    if (requestParameters['nodepoolId'] == null) {
      throw new runtime.RequiredError(
        'nodepoolId',
        'Required parameter "nodepoolId" was null or undefined when calling recycleNodepoolInstance().',
      );
    }

    if (requestParameters['nodeId'] == null) {
      throw new runtime.RequiredError(
        'nodeId',
        'Required parameter "nodeId" was null or undefined when calling recycleNodepoolInstance().',
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

    let urlPath = `/kubernetes/clusters/{vke-id}/node-pools/{nodepool-id}/nodes/{node-id}/recycle`;
    urlPath = urlPath.replace(`{${'vke-id'}}`, encodeURIComponent(String(requestParameters['vkeId'])));
    urlPath = urlPath.replace(`{${'nodepool-id'}}`, encodeURIComponent(String(requestParameters['nodepoolId'])));
    urlPath = urlPath.replace(`{${'node-id'}}`, encodeURIComponent(String(requestParameters['nodeId'])));

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
   * Recycle a specific NodePool Instance
   * Recycle a NodePool Instance
   */
  async recycleNodepoolInstance(
    vkeId: string,
    nodepoolId: string,
    nodeId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.recycleNodepoolInstanceRaw({ vkeId: vkeId, nodepoolId: nodepoolId, nodeId: nodeId }, initOverrides);
  }

  /**
   * Start a Kubernetes cluster upgrade.
   * Start Kubernetes Cluster Upgrade
   */
  async startKubernetesClusterUpgradeRaw(
    requestParameters: StartKubernetesClusterUpgradeOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['vkeId'] == null) {
      throw new runtime.RequiredError(
        'vkeId',
        'Required parameter "vkeId" was null or undefined when calling startKubernetesClusterUpgrade().',
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

    let urlPath = `/kubernetes/clusters/{vke-id}/upgrades`;
    urlPath = urlPath.replace(`{${'vke-id'}}`, encodeURIComponent(String(requestParameters['vkeId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: StartKubernetesClusterUpgradeRequestToJSON(requestParameters['startKubernetesClusterUpgradeRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Start a Kubernetes cluster upgrade.
   * Start Kubernetes Cluster Upgrade
   */
  async startKubernetesClusterUpgrade(
    vkeId: string,
    startKubernetesClusterUpgradeRequest?: StartKubernetesClusterUpgradeRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.startKubernetesClusterUpgradeRaw(
      { vkeId: vkeId, startKubernetesClusterUpgradeRequest: startKubernetesClusterUpgradeRequest },
      initOverrides,
    );
  }

  /**
   * Update Kubernetes Cluster
   * Update Kubernetes Cluster
   */
  async updateKubernetesClusterRaw(
    requestParameters: UpdateKubernetesClusterOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['vkeId'] == null) {
      throw new runtime.RequiredError('vkeId', 'Required parameter "vkeId" was null or undefined when calling updateKubernetesCluster().');
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

    let urlPath = `/kubernetes/clusters/{vke-id}`;
    urlPath = urlPath.replace(`{${'vke-id'}}`, encodeURIComponent(String(requestParameters['vkeId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: UpdateKubernetesClusterRequestToJSON(requestParameters['updateKubernetesClusterRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Update Kubernetes Cluster
   * Update Kubernetes Cluster
   */
  async updateKubernetesCluster(
    vkeId: string,
    updateKubernetesClusterRequest?: UpdateKubernetesClusterRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.updateKubernetesClusterRaw({ vkeId: vkeId, updateKubernetesClusterRequest: updateKubernetesClusterRequest }, initOverrides);
  }

  /**
   * Update a Nodepool on a Kubernetes Cluster
   * Update Nodepool
   */
  async updateNodepoolRaw(
    requestParameters: UpdateNodepoolOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateNodepools201Response>> {
    if (requestParameters['vkeId'] == null) {
      throw new runtime.RequiredError('vkeId', 'Required parameter "vkeId" was null or undefined when calling updateNodepool().');
    }

    if (requestParameters['nodepoolId'] == null) {
      throw new runtime.RequiredError('nodepoolId', 'Required parameter "nodepoolId" was null or undefined when calling updateNodepool().');
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

    let urlPath = `/kubernetes/clusters/{vke-id}/node-pools/{nodepool-id}`;
    urlPath = urlPath.replace(`{${'vke-id'}}`, encodeURIComponent(String(requestParameters['vkeId'])));
    urlPath = urlPath.replace(`{${'nodepool-id'}}`, encodeURIComponent(String(requestParameters['nodepoolId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PATCH',
        headers: headerParameters,
        query: queryParameters,
        body: UpdateNodepoolRequestToJSON(requestParameters['updateNodepoolRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateNodepools201ResponseFromJSON(jsonValue));
  }

  /**
   * Update a Nodepool on a Kubernetes Cluster
   * Update Nodepool
   */
  async updateNodepool(
    vkeId: string,
    nodepoolId: string,
    updateNodepoolRequest?: UpdateNodepoolRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateNodepools201Response> {
    const response = await this.updateNodepoolRaw(
      { vkeId: vkeId, nodepoolId: nodepoolId, updateNodepoolRequest: updateNodepoolRequest },
      initOverrides,
    );
    return await response.value();
  }
}
