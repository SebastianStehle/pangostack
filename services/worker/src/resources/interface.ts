export interface ResourceParameterDescriptor {
  // Type of the parameter: boolean, number, or string.
  type: 'boolean' | 'number' | 'string';

  // Whether the parameter is required.
  required?: boolean;

  // Description of the parameter.
  description: string;

  // Allowed string values (for string type only).
  allowedValues?: string[];

  // Minimum length (for string type).
  minLength?: number;

  // Maximum length (for string type).
  maxLength?: number;
}

export interface ResourceDescriptor {
  // Unique identifier for the resource.
  name: string;

  // Description of the resource.
  description: string;

  // Available parameters for the resource.
  parameters: Record<string, ResourceParameterDescriptor>;
}

type PrimitiveToDescriptorType<T> = T extends string ? 'string' : T extends number ? 'number' : T extends boolean ? 'boolean' : never;

type ParametersFromType<T> = {
  [K in keyof T]: ResourceParameterDescriptor & {
    type: PrimitiveToDescriptorType<T[K]>;
  };
};

export function defineResource<T extends Record<string, string | number | boolean>>(
  input: Omit<ResourceDescriptor, 'parameters'> & { parameters: ParametersFromType<T> },
): ResourceDescriptor {
  return input;
}

export interface ResourceRequest<T = Record<string, boolean | number | string | null>, TResourceContext = Record<string, string>> {
  // Parameters to apply to the resource.
  parameters: T;

  // Context that only contains values that are needed for this resource betwene subsequent calls.
  resourceContext: TResourceContext;

  // The timeout.
  timeoutMs: number;
}

export interface ResourceApplyResult {
  // Context values added or overwritten in the deployment.
  context: Record<string, string>;

  // Context that only contains values that are needed for this resource betwene subsequent calls.
  resourceContext?: Record<string, string> | null;

  // Provides values how to connect to the resource, for example Api Keys.
  connection: Record<string, { value: string; label: string; isPublic: boolean }>;

  // Optional log output.
  log?: string | null;
}

export interface InstanceLog {
  // The identifier for instances or kubernetes deployments.
  instanceId: string;

  // The actual log message.
  messages: string;
}

export interface ResourceLogResult {
  // Logs for individual instances.
  instances: InstanceLog[];
}

export interface ResourceNodeStatus {
  // Name of the node.
  name: string;

  // Whether the node is ready for use.
  isReady: boolean;

  // Optional status message.
  message?: string | null;
}

export interface ResourceWorkloadStatus {
  // Name of the workload.
  name: string;

  // Nodes under the workload.
  nodes: ResourceNodeStatus[];
}

export interface ResourceStatusResult {
  // Workloads created under this status.
  workloads: ResourceWorkloadStatus[];
}

export interface ResourceUsage {
  // The total storage in GB.
  totalStorageGB: number;
}

export interface Resource {
  descriptor: ResourceDescriptor;

  apply(id: string, request: ResourceRequest): Promise<ResourceApplyResult>;

  delete(id: string, request: ResourceRequest): Promise<void>;

  status(id: string, request: ResourceRequest): Promise<ResourceStatusResult>;

  log?(id: string, request: ResourceRequest): Promise<ResourceLogResult>;

  usage?(id: string, request: ResourceRequest): Promise<ResourceUsage>;

  describe?(): Promise<any>;
}

export const RESOURCES_TOKEN = 'RESOURCE';
