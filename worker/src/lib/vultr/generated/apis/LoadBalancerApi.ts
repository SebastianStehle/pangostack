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
  CreateLoadBalancer202Response,
  CreateLoadBalancerForwardingRulesRequest,
  CreateLoadBalancerRequest,
  GetLoadBalancerForwardingRule200Response,
  ListLoadBalancerForwardingRules200Response,
  ListLoadBalancers200Response,
  LoadbalancerFirewallRule,
  UpdateLoadBalancerRequest,
} from '../models/index';
import {
  CreateLoadBalancer202ResponseFromJSON,
  CreateLoadBalancer202ResponseToJSON,
  CreateLoadBalancerForwardingRulesRequestFromJSON,
  CreateLoadBalancerForwardingRulesRequestToJSON,
  CreateLoadBalancerRequestFromJSON,
  CreateLoadBalancerRequestToJSON,
  GetLoadBalancerForwardingRule200ResponseFromJSON,
  GetLoadBalancerForwardingRule200ResponseToJSON,
  ListLoadBalancerForwardingRules200ResponseFromJSON,
  ListLoadBalancerForwardingRules200ResponseToJSON,
  ListLoadBalancers200ResponseFromJSON,
  ListLoadBalancers200ResponseToJSON,
  LoadbalancerFirewallRuleFromJSON,
  LoadbalancerFirewallRuleToJSON,
  UpdateLoadBalancerRequestFromJSON,
  UpdateLoadBalancerRequestToJSON,
} from '../models/index';

export interface CreateLoadBalancerOperationRequest {
  createLoadBalancerRequest?: CreateLoadBalancerRequest;
}

export interface CreateLoadBalancerForwardingRulesOperationRequest {
  loadBalancerId: string;
  createLoadBalancerForwardingRulesRequest?: CreateLoadBalancerForwardingRulesRequest;
}

export interface DeleteLoadBalancerRequest {
  loadBalancerId: string;
}

export interface DeleteLoadBalancerAutoSslRequest {
  loadBalancerId: string;
}

export interface DeleteLoadBalancerForwardingRuleRequest {
  loadBalancerId: string;
  forwardingRuleId: string;
}

export interface DeleteLoadBalancerSslRequest {
  loadBalancerId: string;
}

export interface GetLoadBalancerRequest {
  loadBalancerId: string;
}

export interface GetLoadBalancerForwardingRuleRequest {
  loadBalancerId: string;
  forwardingRuleId: string;
}

export interface GetLoadbalancerFirewallRuleRequest {
  loadbalancerId: string;
  firewallRuleId: string;
}

export interface ListLoadBalancerForwardingRulesRequest {
  loadBalancerId: string;
  perPage?: number;
  cursor?: string;
}

export interface ListLoadBalancersRequest {
  perPage?: number;
  cursor?: string;
}

export interface ListLoadbalancerFirewallRulesRequest {
  loadbalancerId: string;
  perPage?: string;
  cursor?: string;
}

export interface UpdateLoadBalancerOperationRequest {
  loadBalancerId: string;
  updateLoadBalancerRequest?: UpdateLoadBalancerRequest;
}

/**
 *
 */
export class LoadBalancerApi extends runtime.BaseAPI {
  /**
   * Create a new Load Balancer in a particular `region`.
   * Create Load Balancer
   */
  async createLoadBalancerRaw(
    requestParameters: CreateLoadBalancerOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateLoadBalancer202Response>> {
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

    let urlPath = `/load-balancers`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateLoadBalancerRequestToJSON(requestParameters['createLoadBalancerRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateLoadBalancer202ResponseFromJSON(jsonValue));
  }

  /**
   * Create a new Load Balancer in a particular `region`.
   * Create Load Balancer
   */
  async createLoadBalancer(
    createLoadBalancerRequest?: CreateLoadBalancerRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateLoadBalancer202Response> {
    const response = await this.createLoadBalancerRaw({ createLoadBalancerRequest: createLoadBalancerRequest }, initOverrides);
    return await response.value();
  }

  /**
   * Create a new forwarding rule for a Load Balancer.
   * Create Forwarding Rule
   */
  async createLoadBalancerForwardingRulesRaw(
    requestParameters: CreateLoadBalancerForwardingRulesOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['loadBalancerId'] == null) {
      throw new runtime.RequiredError(
        'loadBalancerId',
        'Required parameter "loadBalancerId" was null or undefined when calling createLoadBalancerForwardingRules().',
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

    let urlPath = `/load-balancers/{load-balancer-id}/forwarding-rules`;
    urlPath = urlPath.replace(`{${'load-balancer-id'}}`, encodeURIComponent(String(requestParameters['loadBalancerId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateLoadBalancerForwardingRulesRequestToJSON(requestParameters['createLoadBalancerForwardingRulesRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Create a new forwarding rule for a Load Balancer.
   * Create Forwarding Rule
   */
  async createLoadBalancerForwardingRules(
    loadBalancerId: string,
    createLoadBalancerForwardingRulesRequest?: CreateLoadBalancerForwardingRulesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.createLoadBalancerForwardingRulesRaw(
      { loadBalancerId: loadBalancerId, createLoadBalancerForwardingRulesRequest: createLoadBalancerForwardingRulesRequest },
      initOverrides,
    );
  }

  /**
   * Delete a Load Balancer.
   * Delete Load Balancer
   */
  async deleteLoadBalancerRaw(
    requestParameters: DeleteLoadBalancerRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['loadBalancerId'] == null) {
      throw new runtime.RequiredError(
        'loadBalancerId',
        'Required parameter "loadBalancerId" was null or undefined when calling deleteLoadBalancer().',
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

    let urlPath = `/load-balancers/{load-balancer-id}`;
    urlPath = urlPath.replace(`{${'load-balancer-id'}}`, encodeURIComponent(String(requestParameters['loadBalancerId'])));

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
   * Delete a Load Balancer.
   * Delete Load Balancer
   */
  async deleteLoadBalancer(loadBalancerId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.deleteLoadBalancerRaw({ loadBalancerId: loadBalancerId }, initOverrides);
  }

  /**
   * Disable a Load Balancer Auto SSL. This will not remove an ssl certificate from the load balancer.
   * Disable Load Balancer Auto SSL
   */
  async deleteLoadBalancerAutoSslRaw(
    requestParameters: DeleteLoadBalancerAutoSslRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['loadBalancerId'] == null) {
      throw new runtime.RequiredError(
        'loadBalancerId',
        'Required parameter "loadBalancerId" was null or undefined when calling deleteLoadBalancerAutoSsl().',
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

    let urlPath = `/load-balancers/{load-balancer-id}/auto_ssl`;
    urlPath = urlPath.replace(`{${'load-balancer-id'}}`, encodeURIComponent(String(requestParameters['loadBalancerId'])));

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
   * Disable a Load Balancer Auto SSL. This will not remove an ssl certificate from the load balancer.
   * Disable Load Balancer Auto SSL
   */
  async deleteLoadBalancerAutoSsl(loadBalancerId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.deleteLoadBalancerAutoSslRaw({ loadBalancerId: loadBalancerId }, initOverrides);
  }

  /**
   * Delete a Forwarding Rule on a Load Balancer.
   * Delete Forwarding Rule
   */
  async deleteLoadBalancerForwardingRuleRaw(
    requestParameters: DeleteLoadBalancerForwardingRuleRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['loadBalancerId'] == null) {
      throw new runtime.RequiredError(
        'loadBalancerId',
        'Required parameter "loadBalancerId" was null or undefined when calling deleteLoadBalancerForwardingRule().',
      );
    }

    if (requestParameters['forwardingRuleId'] == null) {
      throw new runtime.RequiredError(
        'forwardingRuleId',
        'Required parameter "forwardingRuleId" was null or undefined when calling deleteLoadBalancerForwardingRule().',
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

    let urlPath = `/load-balancers/{load-balancer-id}/forwarding-rules/{forwarding-rule-id}`;
    urlPath = urlPath.replace(`{${'load-balancer-id'}}`, encodeURIComponent(String(requestParameters['loadBalancerId'])));
    urlPath = urlPath.replace(`{${'forwarding-rule-id'}}`, encodeURIComponent(String(requestParameters['forwardingRuleId'])));

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
   * Delete a Forwarding Rule on a Load Balancer.
   * Delete Forwarding Rule
   */
  async deleteLoadBalancerForwardingRule(
    loadBalancerId: string,
    forwardingRuleId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.deleteLoadBalancerForwardingRuleRaw({ loadBalancerId: loadBalancerId, forwardingRuleId: forwardingRuleId }, initOverrides);
  }

  /**
   * Delete a Load Balancer SSL.
   * Delete Load Balancer SSL
   */
  async deleteLoadBalancerSslRaw(
    requestParameters: DeleteLoadBalancerSslRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['loadBalancerId'] == null) {
      throw new runtime.RequiredError(
        'loadBalancerId',
        'Required parameter "loadBalancerId" was null or undefined when calling deleteLoadBalancerSsl().',
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

    let urlPath = `/load-balancers/{load-balancer-id}/ssl`;
    urlPath = urlPath.replace(`{${'load-balancer-id'}}`, encodeURIComponent(String(requestParameters['loadBalancerId'])));

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
   * Delete a Load Balancer SSL.
   * Delete Load Balancer SSL
   */
  async deleteLoadBalancerSsl(loadBalancerId: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.deleteLoadBalancerSslRaw({ loadBalancerId: loadBalancerId }, initOverrides);
  }

  /**
   * Get information for a Load Balancer.
   * Get Load Balancer
   */
  async getLoadBalancerRaw(
    requestParameters: GetLoadBalancerRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateLoadBalancer202Response>> {
    if (requestParameters['loadBalancerId'] == null) {
      throw new runtime.RequiredError(
        'loadBalancerId',
        'Required parameter "loadBalancerId" was null or undefined when calling getLoadBalancer().',
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

    let urlPath = `/load-balancers/{load-balancer-id}`;
    urlPath = urlPath.replace(`{${'load-balancer-id'}}`, encodeURIComponent(String(requestParameters['loadBalancerId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateLoadBalancer202ResponseFromJSON(jsonValue));
  }

  /**
   * Get information for a Load Balancer.
   * Get Load Balancer
   */
  async getLoadBalancer(
    loadBalancerId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateLoadBalancer202Response> {
    const response = await this.getLoadBalancerRaw({ loadBalancerId: loadBalancerId }, initOverrides);
    return await response.value();
  }

  /**
   * Get information for a Forwarding Rule on a Load Balancer.
   * Get Forwarding Rule
   */
  async getLoadBalancerForwardingRuleRaw(
    requestParameters: GetLoadBalancerForwardingRuleRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetLoadBalancerForwardingRule200Response>> {
    if (requestParameters['loadBalancerId'] == null) {
      throw new runtime.RequiredError(
        'loadBalancerId',
        'Required parameter "loadBalancerId" was null or undefined when calling getLoadBalancerForwardingRule().',
      );
    }

    if (requestParameters['forwardingRuleId'] == null) {
      throw new runtime.RequiredError(
        'forwardingRuleId',
        'Required parameter "forwardingRuleId" was null or undefined when calling getLoadBalancerForwardingRule().',
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

    let urlPath = `/load-balancers/{load-balancer-id}/forwarding-rules/{forwarding-rule-id}`;
    urlPath = urlPath.replace(`{${'load-balancer-id'}}`, encodeURIComponent(String(requestParameters['loadBalancerId'])));
    urlPath = urlPath.replace(`{${'forwarding-rule-id'}}`, encodeURIComponent(String(requestParameters['forwardingRuleId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetLoadBalancerForwardingRule200ResponseFromJSON(jsonValue));
  }

  /**
   * Get information for a Forwarding Rule on a Load Balancer.
   * Get Forwarding Rule
   */
  async getLoadBalancerForwardingRule(
    loadBalancerId: string,
    forwardingRuleId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetLoadBalancerForwardingRule200Response> {
    const response = await this.getLoadBalancerForwardingRuleRaw(
      { loadBalancerId: loadBalancerId, forwardingRuleId: forwardingRuleId },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Get a firewall rule for a Load Balancer.
   * Get Firewall Rule
   */
  async getLoadbalancerFirewallRuleRaw(
    requestParameters: GetLoadbalancerFirewallRuleRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<LoadbalancerFirewallRule>> {
    if (requestParameters['loadbalancerId'] == null) {
      throw new runtime.RequiredError(
        'loadbalancerId',
        'Required parameter "loadbalancerId" was null or undefined when calling getLoadbalancerFirewallRule().',
      );
    }

    if (requestParameters['firewallRuleId'] == null) {
      throw new runtime.RequiredError(
        'firewallRuleId',
        'Required parameter "firewallRuleId" was null or undefined when calling getLoadbalancerFirewallRule().',
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

    let urlPath = `/load-balancers/{loadbalancer-id}/firewall-rules/{firewall-rule-id}`;
    urlPath = urlPath.replace(`{${'loadbalancer-id'}}`, encodeURIComponent(String(requestParameters['loadbalancerId'])));
    urlPath = urlPath.replace(`{${'firewall-rule-id'}}`, encodeURIComponent(String(requestParameters['firewallRuleId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => LoadbalancerFirewallRuleFromJSON(jsonValue));
  }

  /**
   * Get a firewall rule for a Load Balancer.
   * Get Firewall Rule
   */
  async getLoadbalancerFirewallRule(
    loadbalancerId: string,
    firewallRuleId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<LoadbalancerFirewallRule> {
    const response = await this.getLoadbalancerFirewallRuleRaw(
      { loadbalancerId: loadbalancerId, firewallRuleId: firewallRuleId },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * List the fowarding rules for a Load Balancer.
   * List Forwarding Rules
   */
  async listLoadBalancerForwardingRulesRaw(
    requestParameters: ListLoadBalancerForwardingRulesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListLoadBalancerForwardingRules200Response>> {
    if (requestParameters['loadBalancerId'] == null) {
      throw new runtime.RequiredError(
        'loadBalancerId',
        'Required parameter "loadBalancerId" was null or undefined when calling listLoadBalancerForwardingRules().',
      );
    }

    const queryParameters: any = {};

    if (requestParameters['perPage'] != null) {
      queryParameters['per_page'] = requestParameters['perPage'];
    }

    if (requestParameters['cursor'] != null) {
      queryParameters['cursor'] = requestParameters['cursor'];
    }

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/load-balancers/{load-balancer-id}/forwarding-rules`;
    urlPath = urlPath.replace(`{${'load-balancer-id'}}`, encodeURIComponent(String(requestParameters['loadBalancerId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListLoadBalancerForwardingRules200ResponseFromJSON(jsonValue));
  }

  /**
   * List the fowarding rules for a Load Balancer.
   * List Forwarding Rules
   */
  async listLoadBalancerForwardingRules(
    loadBalancerId: string,
    perPage?: number,
    cursor?: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListLoadBalancerForwardingRules200Response> {
    const response = await this.listLoadBalancerForwardingRulesRaw(
      { loadBalancerId: loadBalancerId, perPage: perPage, cursor: cursor },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * List the Load Balancers in your account.
   * List Load Balancers
   */
  async listLoadBalancersRaw(
    requestParameters: ListLoadBalancersRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListLoadBalancers200Response>> {
    const queryParameters: any = {};

    if (requestParameters['perPage'] != null) {
      queryParameters['per_page'] = requestParameters['perPage'];
    }

    if (requestParameters['cursor'] != null) {
      queryParameters['cursor'] = requestParameters['cursor'];
    }

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/load-balancers`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListLoadBalancers200ResponseFromJSON(jsonValue));
  }

  /**
   * List the Load Balancers in your account.
   * List Load Balancers
   */
  async listLoadBalancers(
    perPage?: number,
    cursor?: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListLoadBalancers200Response> {
    const response = await this.listLoadBalancersRaw({ perPage: perPage, cursor: cursor }, initOverrides);
    return await response.value();
  }

  /**
   * List the firewall rules for a Load Balancer.
   * List Firewall Rules
   */
  async listLoadbalancerFirewallRulesRaw(
    requestParameters: ListLoadbalancerFirewallRulesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<LoadbalancerFirewallRule>> {
    if (requestParameters['loadbalancerId'] == null) {
      throw new runtime.RequiredError(
        'loadbalancerId',
        'Required parameter "loadbalancerId" was null or undefined when calling listLoadbalancerFirewallRules().',
      );
    }

    const queryParameters: any = {};

    if (requestParameters['perPage'] != null) {
      queryParameters['per_page'] = requestParameters['perPage'];
    }

    if (requestParameters['cursor'] != null) {
      queryParameters['cursor'] = requestParameters['cursor'];
    }

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('API Key', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    let urlPath = `/load-balancers/{loadbalancer-id}/firewall-rules`;
    urlPath = urlPath.replace(`{${'loadbalancer-id'}}`, encodeURIComponent(String(requestParameters['loadbalancerId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => LoadbalancerFirewallRuleFromJSON(jsonValue));
  }

  /**
   * List the firewall rules for a Load Balancer.
   * List Firewall Rules
   */
  async listLoadbalancerFirewallRules(
    loadbalancerId: string,
    perPage?: string,
    cursor?: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<LoadbalancerFirewallRule> {
    const response = await this.listLoadbalancerFirewallRulesRaw(
      { loadbalancerId: loadbalancerId, perPage: perPage, cursor: cursor },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Update information for a Load Balancer. All attributes are optional. If not set, the attributes will retain their original values.
   * Update Load Balancer
   */
  async updateLoadBalancerRaw(
    requestParameters: UpdateLoadBalancerOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['loadBalancerId'] == null) {
      throw new runtime.RequiredError(
        'loadBalancerId',
        'Required parameter "loadBalancerId" was null or undefined when calling updateLoadBalancer().',
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

    let urlPath = `/load-balancers/{load-balancer-id}`;
    urlPath = urlPath.replace(`{${'load-balancer-id'}}`, encodeURIComponent(String(requestParameters['loadBalancerId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PATCH',
        headers: headerParameters,
        query: queryParameters,
        body: UpdateLoadBalancerRequestToJSON(requestParameters['updateLoadBalancerRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Update information for a Load Balancer. All attributes are optional. If not set, the attributes will retain their original values.
   * Update Load Balancer
   */
  async updateLoadBalancer(
    loadBalancerId: string,
    updateLoadBalancerRequest?: UpdateLoadBalancerRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.updateLoadBalancerRaw(
      { loadBalancerId: loadBalancerId, updateLoadBalancerRequest: updateLoadBalancerRequest },
      initOverrides,
    );
  }
}
