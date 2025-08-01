export interface ResourceParameterDescriptor {
  // Type of the parameter: boolean, number, or string
  readonly type: 'boolean' | 'number' | 'string';

  // Whether the parameter is required
  readonly required?: boolean;

  // Description of the parameter
  readonly description: string;

  // Allowed string values (for string type only)
  readonly allowedValues?: string[];

  // Minimum length (for string type)
  readonly minLength?: number;

  // Maximum length (for string type)
  readonly maxLength?: number;
}

export class ResourceDescriptor {
  // Unique identifier for the resource
  readonly name: string;

  // Description of the resource
  readonly description: string;

  // Available parameters for the resource
  readonly parameters: Record<string, ResourceParameterDescriptor>;
}

export interface ResourceRequest {
  // Parameters to apply to the resource
  readonly parameters: Record<string, boolean | number | string | null>;
}

export interface ResourceApplyResult {
  // Context values added or overwritten in the deployment
  readonly context: Record<string, string>;

  // Provides values how to connect to the resource, for example Api Keys.
  readonly connection: Record<string, { value: string; label: string }>;

  // Optional log output
  readonly log?: string;
}

export interface ResourceNodeStatus {
  // Name of the node
  readonly name: string;

  // Whether the node is ready for use
  readonly isReady: boolean;

  // Optional status message
  readonly message?: string;
}

export interface ResourceWorkloadStatus {
  // Name of the workload
  readonly name: string;

  // Nodes under the workload
  readonly nodes: ResourceNodeStatus[];
}

export class ResourceStatusResult {
  // Workloads created under this status
  readonly workloads: ResourceWorkloadStatus[] = [];
}

export interface Resource {
  descriptor: ResourceDescriptor;

  apply(id: string, request: ResourceRequest): Promise<ResourceApplyResult>;

  delete(id: string, request: ResourceRequest): Promise<void>;

  status(id: string, request: ResourceRequest): Promise<ResourceStatusResult>;
}

export const RESOURCE_TOKEN = 'RESOURCE';
