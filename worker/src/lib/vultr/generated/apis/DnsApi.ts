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
  CreateDnsDomain200Response,
  CreateDnsDomainRecord201Response,
  CreateDnsDomainRecordRequest,
  CreateDnsDomainRequest,
  GetDnsDomainDnssec200Response,
  GetDnsDomainSoa200Response,
  ListDnsDomainRecords200Response,
  ListDnsDomains200Response,
  UpdateDnsDomainRecordRequest,
  UpdateDnsDomainRequest,
  UpdateDnsDomainSoaRequest,
} from '../models/index';
import {
  CreateDnsDomain200ResponseFromJSON,
  CreateDnsDomain200ResponseToJSON,
  CreateDnsDomainRecord201ResponseFromJSON,
  CreateDnsDomainRecord201ResponseToJSON,
  CreateDnsDomainRecordRequestFromJSON,
  CreateDnsDomainRecordRequestToJSON,
  CreateDnsDomainRequestFromJSON,
  CreateDnsDomainRequestToJSON,
  GetDnsDomainDnssec200ResponseFromJSON,
  GetDnsDomainDnssec200ResponseToJSON,
  GetDnsDomainSoa200ResponseFromJSON,
  GetDnsDomainSoa200ResponseToJSON,
  ListDnsDomainRecords200ResponseFromJSON,
  ListDnsDomainRecords200ResponseToJSON,
  ListDnsDomains200ResponseFromJSON,
  ListDnsDomains200ResponseToJSON,
  UpdateDnsDomainRecordRequestFromJSON,
  UpdateDnsDomainRecordRequestToJSON,
  UpdateDnsDomainRequestFromJSON,
  UpdateDnsDomainRequestToJSON,
  UpdateDnsDomainSoaRequestFromJSON,
  UpdateDnsDomainSoaRequestToJSON,
} from '../models/index';

export interface CreateDnsDomainOperationRequest {
  createDnsDomainRequest?: CreateDnsDomainRequest;
}

export interface CreateDnsDomainRecordOperationRequest {
  dnsDomain: string;
  createDnsDomainRecordRequest?: CreateDnsDomainRecordRequest;
}

export interface DeleteDnsDomainRequest {
  dnsDomain: string;
}

export interface DeleteDnsDomainRecordRequest {
  dnsDomain: string;
  recordId: string;
}

export interface GetDnsDomainRequest {
  dnsDomain: string;
}

export interface GetDnsDomainDnssecRequest {
  dnsDomain: string;
}

export interface GetDnsDomainRecordRequest {
  dnsDomain: string;
  recordId: string;
}

export interface GetDnsDomainSoaRequest {
  dnsDomain: string;
}

export interface ListDnsDomainRecordsRequest {
  dnsDomain: string;
  perPage?: number;
  cursor?: string;
}

export interface ListDnsDomainsRequest {
  perPage?: number;
  cursor?: string;
}

export interface UpdateDnsDomainOperationRequest {
  dnsDomain: string;
  updateDnsDomainRequest?: UpdateDnsDomainRequest;
}

export interface UpdateDnsDomainRecordOperationRequest {
  dnsDomain: string;
  recordId: string;
  updateDnsDomainRecordRequest?: UpdateDnsDomainRecordRequest;
}

export interface UpdateDnsDomainSoaOperationRequest {
  dnsDomain: string;
  updateDnsDomainSoaRequest?: UpdateDnsDomainSoaRequest;
}

/**
 *
 */
export class DnsApi extends runtime.BaseAPI {
  /**
   * Create a DNS Domain for `domain`. If no `ip` address is supplied a domain with no records will be created.
   * Create DNS Domain
   */
  async createDnsDomainRaw(
    requestParameters: CreateDnsDomainOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDnsDomain200Response>> {
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

    let urlPath = `/domains`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateDnsDomainRequestToJSON(requestParameters['createDnsDomainRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDnsDomain200ResponseFromJSON(jsonValue));
  }

  /**
   * Create a DNS Domain for `domain`. If no `ip` address is supplied a domain with no records will be created.
   * Create DNS Domain
   */
  async createDnsDomain(
    createDnsDomainRequest?: CreateDnsDomainRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDnsDomain200Response> {
    const response = await this.createDnsDomainRaw({ createDnsDomainRequest: createDnsDomainRequest }, initOverrides);
    return await response.value();
  }

  /**
   * Create a DNS record.
   * Create Record
   */
  async createDnsDomainRecordRaw(
    requestParameters: CreateDnsDomainRecordOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDnsDomainRecord201Response>> {
    if (requestParameters['dnsDomain'] == null) {
      throw new runtime.RequiredError(
        'dnsDomain',
        'Required parameter "dnsDomain" was null or undefined when calling createDnsDomainRecord().',
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

    let urlPath = `/domains/{dns-domain}/records`;
    urlPath = urlPath.replace(`{${'dns-domain'}}`, encodeURIComponent(String(requestParameters['dnsDomain'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: CreateDnsDomainRecordRequestToJSON(requestParameters['createDnsDomainRecordRequest']),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDnsDomainRecord201ResponseFromJSON(jsonValue));
  }

  /**
   * Create a DNS record.
   * Create Record
   */
  async createDnsDomainRecord(
    dnsDomain: string,
    createDnsDomainRecordRequest?: CreateDnsDomainRecordRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDnsDomainRecord201Response> {
    const response = await this.createDnsDomainRecordRaw(
      { dnsDomain: dnsDomain, createDnsDomainRecordRequest: createDnsDomainRecordRequest },
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Delete the DNS Domain.
   * Delete Domain
   */
  async deleteDnsDomainRaw(
    requestParameters: DeleteDnsDomainRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['dnsDomain'] == null) {
      throw new runtime.RequiredError('dnsDomain', 'Required parameter "dnsDomain" was null or undefined when calling deleteDnsDomain().');
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

    let urlPath = `/domains/{dns-domain}`;
    urlPath = urlPath.replace(`{${'dns-domain'}}`, encodeURIComponent(String(requestParameters['dnsDomain'])));

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
   * Delete the DNS Domain.
   * Delete Domain
   */
  async deleteDnsDomain(dnsDomain: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
    await this.deleteDnsDomainRaw({ dnsDomain: dnsDomain }, initOverrides);
  }

  /**
   * Delete the DNS record.
   * Delete Record
   */
  async deleteDnsDomainRecordRaw(
    requestParameters: DeleteDnsDomainRecordRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['dnsDomain'] == null) {
      throw new runtime.RequiredError(
        'dnsDomain',
        'Required parameter "dnsDomain" was null or undefined when calling deleteDnsDomainRecord().',
      );
    }

    if (requestParameters['recordId'] == null) {
      throw new runtime.RequiredError(
        'recordId',
        'Required parameter "recordId" was null or undefined when calling deleteDnsDomainRecord().',
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

    let urlPath = `/domains/{dns-domain}/records/{record-id}`;
    urlPath = urlPath.replace(`{${'dns-domain'}}`, encodeURIComponent(String(requestParameters['dnsDomain'])));
    urlPath = urlPath.replace(`{${'record-id'}}`, encodeURIComponent(String(requestParameters['recordId'])));

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
   * Delete the DNS record.
   * Delete Record
   */
  async deleteDnsDomainRecord(
    dnsDomain: string,
    recordId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.deleteDnsDomainRecordRaw({ dnsDomain: dnsDomain, recordId: recordId }, initOverrides);
  }

  /**
   * Get information for the DNS Domain.
   * Get DNS Domain
   */
  async getDnsDomainRaw(
    requestParameters: GetDnsDomainRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDnsDomain200Response>> {
    if (requestParameters['dnsDomain'] == null) {
      throw new runtime.RequiredError('dnsDomain', 'Required parameter "dnsDomain" was null or undefined when calling getDnsDomain().');
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

    let urlPath = `/domains/{dns-domain}`;
    urlPath = urlPath.replace(`{${'dns-domain'}}`, encodeURIComponent(String(requestParameters['dnsDomain'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDnsDomain200ResponseFromJSON(jsonValue));
  }

  /**
   * Get information for the DNS Domain.
   * Get DNS Domain
   */
  async getDnsDomain(dnsDomain: string, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<CreateDnsDomain200Response> {
    const response = await this.getDnsDomainRaw({ dnsDomain: dnsDomain }, initOverrides);
    return await response.value();
  }

  /**
   * Get the DNSSEC information for the DNS Domain.
   * Get DNSSec Info
   */
  async getDnsDomainDnssecRaw(
    requestParameters: GetDnsDomainDnssecRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetDnsDomainDnssec200Response>> {
    if (requestParameters['dnsDomain'] == null) {
      throw new runtime.RequiredError(
        'dnsDomain',
        'Required parameter "dnsDomain" was null or undefined when calling getDnsDomainDnssec().',
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

    let urlPath = `/domains/{dns-domain}/dnssec`;
    urlPath = urlPath.replace(`{${'dns-domain'}}`, encodeURIComponent(String(requestParameters['dnsDomain'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetDnsDomainDnssec200ResponseFromJSON(jsonValue));
  }

  /**
   * Get the DNSSEC information for the DNS Domain.
   * Get DNSSec Info
   */
  async getDnsDomainDnssec(
    dnsDomain: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetDnsDomainDnssec200Response> {
    const response = await this.getDnsDomainDnssecRaw({ dnsDomain: dnsDomain }, initOverrides);
    return await response.value();
  }

  /**
   * Get information for a DNS Record.
   * Get Record
   */
  async getDnsDomainRecordRaw(
    requestParameters: GetDnsDomainRecordRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<CreateDnsDomainRecord201Response>> {
    if (requestParameters['dnsDomain'] == null) {
      throw new runtime.RequiredError(
        'dnsDomain',
        'Required parameter "dnsDomain" was null or undefined when calling getDnsDomainRecord().',
      );
    }

    if (requestParameters['recordId'] == null) {
      throw new runtime.RequiredError('recordId', 'Required parameter "recordId" was null or undefined when calling getDnsDomainRecord().');
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

    let urlPath = `/domains/{dns-domain}/records/{record-id}`;
    urlPath = urlPath.replace(`{${'dns-domain'}}`, encodeURIComponent(String(requestParameters['dnsDomain'])));
    urlPath = urlPath.replace(`{${'record-id'}}`, encodeURIComponent(String(requestParameters['recordId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => CreateDnsDomainRecord201ResponseFromJSON(jsonValue));
  }

  /**
   * Get information for a DNS Record.
   * Get Record
   */
  async getDnsDomainRecord(
    dnsDomain: string,
    recordId: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<CreateDnsDomainRecord201Response> {
    const response = await this.getDnsDomainRecordRaw({ dnsDomain: dnsDomain, recordId: recordId }, initOverrides);
    return await response.value();
  }

  /**
   * Get SOA information for the DNS Domain.
   * Get SOA information
   */
  async getDnsDomainSoaRaw(
    requestParameters: GetDnsDomainSoaRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetDnsDomainSoa200Response>> {
    if (requestParameters['dnsDomain'] == null) {
      throw new runtime.RequiredError('dnsDomain', 'Required parameter "dnsDomain" was null or undefined when calling getDnsDomainSoa().');
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

    let urlPath = `/domains/{dns-domain}/soa`;
    urlPath = urlPath.replace(`{${'dns-domain'}}`, encodeURIComponent(String(requestParameters['dnsDomain'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetDnsDomainSoa200ResponseFromJSON(jsonValue));
  }

  /**
   * Get SOA information for the DNS Domain.
   * Get SOA information
   */
  async getDnsDomainSoa(
    dnsDomain: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetDnsDomainSoa200Response> {
    const response = await this.getDnsDomainSoaRaw({ dnsDomain: dnsDomain }, initOverrides);
    return await response.value();
  }

  /**
   * Get the DNS records for the Domain.
   * List Records
   */
  async listDnsDomainRecordsRaw(
    requestParameters: ListDnsDomainRecordsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListDnsDomainRecords200Response>> {
    if (requestParameters['dnsDomain'] == null) {
      throw new runtime.RequiredError(
        'dnsDomain',
        'Required parameter "dnsDomain" was null or undefined when calling listDnsDomainRecords().',
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

    let urlPath = `/domains/{dns-domain}/records`;
    urlPath = urlPath.replace(`{${'dns-domain'}}`, encodeURIComponent(String(requestParameters['dnsDomain'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListDnsDomainRecords200ResponseFromJSON(jsonValue));
  }

  /**
   * Get the DNS records for the Domain.
   * List Records
   */
  async listDnsDomainRecords(
    dnsDomain: string,
    perPage?: number,
    cursor?: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListDnsDomainRecords200Response> {
    const response = await this.listDnsDomainRecordsRaw({ dnsDomain: dnsDomain, perPage: perPage, cursor: cursor }, initOverrides);
    return await response.value();
  }

  /**
   * List all DNS Domains in your account.
   * List DNS Domains
   */
  async listDnsDomainsRaw(
    requestParameters: ListDnsDomainsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<ListDnsDomains200Response>> {
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

    let urlPath = `/domains`;

    const response = await this.request(
      {
        path: urlPath,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => ListDnsDomains200ResponseFromJSON(jsonValue));
  }

  /**
   * List all DNS Domains in your account.
   * List DNS Domains
   */
  async listDnsDomains(
    perPage?: number,
    cursor?: string,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<ListDnsDomains200Response> {
    const response = await this.listDnsDomainsRaw({ perPage: perPage, cursor: cursor }, initOverrides);
    return await response.value();
  }

  /**
   * Update the DNS Domain.
   * Update a DNS Domain
   */
  async updateDnsDomainRaw(
    requestParameters: UpdateDnsDomainOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['dnsDomain'] == null) {
      throw new runtime.RequiredError('dnsDomain', 'Required parameter "dnsDomain" was null or undefined when calling updateDnsDomain().');
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

    let urlPath = `/domains/{dns-domain}`;
    urlPath = urlPath.replace(`{${'dns-domain'}}`, encodeURIComponent(String(requestParameters['dnsDomain'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: UpdateDnsDomainRequestToJSON(requestParameters['updateDnsDomainRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Update the DNS Domain.
   * Update a DNS Domain
   */
  async updateDnsDomain(
    dnsDomain: string,
    updateDnsDomainRequest?: UpdateDnsDomainRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.updateDnsDomainRaw({ dnsDomain: dnsDomain, updateDnsDomainRequest: updateDnsDomainRequest }, initOverrides);
  }

  /**
   * Update the information for a DNS record. All attributes are optional. If not set, the attributes will retain their original values.
   * Update Record
   */
  async updateDnsDomainRecordRaw(
    requestParameters: UpdateDnsDomainRecordOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['dnsDomain'] == null) {
      throw new runtime.RequiredError(
        'dnsDomain',
        'Required parameter "dnsDomain" was null or undefined when calling updateDnsDomainRecord().',
      );
    }

    if (requestParameters['recordId'] == null) {
      throw new runtime.RequiredError(
        'recordId',
        'Required parameter "recordId" was null or undefined when calling updateDnsDomainRecord().',
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

    let urlPath = `/domains/{dns-domain}/records/{record-id}`;
    urlPath = urlPath.replace(`{${'dns-domain'}}`, encodeURIComponent(String(requestParameters['dnsDomain'])));
    urlPath = urlPath.replace(`{${'record-id'}}`, encodeURIComponent(String(requestParameters['recordId'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PATCH',
        headers: headerParameters,
        query: queryParameters,
        body: UpdateDnsDomainRecordRequestToJSON(requestParameters['updateDnsDomainRecordRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Update the information for a DNS record. All attributes are optional. If not set, the attributes will retain their original values.
   * Update Record
   */
  async updateDnsDomainRecord(
    dnsDomain: string,
    recordId: string,
    updateDnsDomainRecordRequest?: UpdateDnsDomainRecordRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.updateDnsDomainRecordRaw(
      { dnsDomain: dnsDomain, recordId: recordId, updateDnsDomainRecordRequest: updateDnsDomainRecordRequest },
      initOverrides,
    );
  }

  /**
   * Update the SOA information for the DNS Domain. All attributes are optional. If not set, the attributes will retain their original values.
   * Update SOA information
   */
  async updateDnsDomainSoaRaw(
    requestParameters: UpdateDnsDomainSoaOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['dnsDomain'] == null) {
      throw new runtime.RequiredError(
        'dnsDomain',
        'Required parameter "dnsDomain" was null or undefined when calling updateDnsDomainSoa().',
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

    let urlPath = `/domains/{dns-domain}/soa`;
    urlPath = urlPath.replace(`{${'dns-domain'}}`, encodeURIComponent(String(requestParameters['dnsDomain'])));

    const response = await this.request(
      {
        path: urlPath,
        method: 'PATCH',
        headers: headerParameters,
        query: queryParameters,
        body: UpdateDnsDomainSoaRequestToJSON(requestParameters['updateDnsDomainSoaRequest']),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Update the SOA information for the DNS Domain. All attributes are optional. If not set, the attributes will retain their original values.
   * Update SOA information
   */
  async updateDnsDomainSoa(
    dnsDomain: string,
    updateDnsDomainSoaRequest?: UpdateDnsDomainSoaRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.updateDnsDomainSoaRaw({ dnsDomain: dnsDomain, updateDnsDomainSoaRequest: updateDnsDomainSoaRequest }, initOverrides);
  }
}
