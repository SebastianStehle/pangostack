export interface ResourceValueDescriptor {
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

export interface ResourceMetricDescriptor {
  // Description of the metric.
  description: string;
}

export interface ResourceDescriptor {
  // Unique identifier for the resource.
  name: string;

  // Description of the resource.
  description: string;

  // Available parameters for the resource.
  parameters: Record<string, ResourceValueDescriptor>;

  // The returned context.
  context: Record<string, ResourceValueDescriptor>;

  // The metrics that the resource can provide.
  metrics?: Record<string, ResourceMetricDescriptor>;
}

type PrimitiveToDescriptorType<T> = T extends string ? 'string' : T extends number ? 'number' : T extends boolean ? 'boolean' : never;

type ParametersOrContextFromType<T> = {
  [K in keyof T]: ResourceValueDescriptor & {
    type: PrimitiveToDescriptorType<T[K]>;
  };
};

export type ParametersOrContextValue = string | number | boolean;

type ParametersOrContext = Record<string, ParametersOrContextValue>;

export function defineResource<TParameters extends ParametersOrContext, TContext extends ParametersOrContext>(
  input: Omit<ResourceDescriptor, 'parameters' | 'context'> & {
    parameters: ParametersOrContextFromType<TParameters>;
    context: ParametersOrContextFromType<TContext>;
  },
): ResourceDescriptor {
  return input;
}

export interface ResourceRequest<T = ParametersOrContext, TResourceContext = Record<string, string>> {
  // Parameters to apply to the resource.
  parameters: T;

  // Context that only contains values that are needed for this resource betwene subsequent calls.
  resourceContext: TResourceContext;

  // The timeout.
  timeoutMs: number;
}

// Provides values how to connect to the resource, for example Api Keys.
export interface ConnectionInfo {
  value: string;
  label: string;
  isPublic: boolean;
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

  // Provides values how to connect to the resource, for example Api Keys.
  connection?: Record<string, ConnectionInfo>;
}

export interface ResourceUsage {
  // The total storage in GB.
  totalStorageGB: number;
}

// Each metric provides an object with multiple named values, for example { used: 4, total: 8 }.
export type ResourceMetricValues = Record<string, number>;

export interface ResourceMetricsResult {
  // The collected values per metric name.
  metrics: Record<string, ResourceMetricValues>;
}

export type ResourceEventBase = { timestamp: Date };
export type ResourceStartStepEvent = { type: 'startStep'; id: string; name: string } & ResourceEventBase;
export type ResourceCompleteStepEvent = { type: 'completeStep'; id: string } & ResourceEventBase;
export type ResourceFailStepEvent = { type: 'failStep'; id: string; message: string | null } & ResourceEventBase;
export type ResourceAppendLogEvent = { type: 'appendLog'; stepId: string | null; message: string } & ResourceEventBase;
export type ResourceAppendContextEvent = { type: 'appendContext'; context: Record<string, ParametersOrContextValue> } & ResourceEventBase;
export type ResourceAppendResourceContextEvent = { type: 'appendResourceContext'; context: Record<string, string> } & ResourceEventBase;
export type ResourceAppendConnectionEvent = { type: 'appendConnection'; connection: Record<string, ConnectionInfo> } & ResourceEventBase;
export type ResourceCompleteEvent = { type: 'complete' } & ResourceEventBase;
export type ResourceFailEvent = { type: 'fail'; error: string } & ResourceEventBase;

export type ResourceEvent =
  | ResourceStartStepEvent
  | ResourceCompleteStepEvent
  | ResourceFailStepEvent
  | ResourceAppendLogEvent
  | ResourceAppendContextEvent
  | ResourceAppendResourceContextEvent
  | ResourceAppendConnectionEvent
  | ResourceCompleteEvent
  | ResourceFailEvent;

// The single channel through which apply emits everything it produces: sub-steps, log output,
// context, connection info and resource-context. Values are reported incrementally so that they
// are persisted as they happen and are never lost when a later step fails. It is also the only
// output sink - provisioners do not log separately.
export interface ResourceReporter {
  // Starts a new sub-step and completes the previous one.
  beginStep(name: string): void;

  // Appends a line to the current sub-step's log. Pass { log: true } to additionally write it to
  // the worker's own logger for operators.
  report(message: string, options?: { log?: boolean }): void;

  // Adds or overwrites context values in the deployment, consumed by dependent resources.
  appendContext(context: Record<string, ParametersOrContextValue>): void;

  // Adds or overwrites the resource-scoped context that is persisted between subsequent apply calls.
  appendResourceContext(context: Record<string, string>): void;

  // Adds or overwrites connection info, for example IP addresses or Api Keys.
  appendConnection(connections: Record<string, ConnectionInfo>): void;
}

export interface Resource {
  descriptor: ResourceDescriptor;

  apply(id: string, request: ResourceRequest, reporter: ResourceReporter): Promise<void>;

  verify?(id: string, request: ResourceRequest): Promise<boolean>;

  delete(id: string, request: ResourceRequest): Promise<void>;

  status(id: string, request: ResourceRequest): Promise<ResourceStatusResult>;

  log?(id: string, request: ResourceRequest): Promise<ResourceLogResult>;

  usage?(id: string, request: ResourceRequest): Promise<ResourceUsage>;

  metrics?(id: string, request: ResourceRequest): Promise<ResourceMetricsResult>;

  describe?(): Promise<any>;
}

export const RESOURCES_TOKEN = 'RESOURCE';
