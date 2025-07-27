export interface ResourceParameterDescriptor {
  /**
   * The type.
   */
  readonly type: 'boolean' | 'number' | 'string';

  /**
   * The True if required.
   */
  readonly required?: boolean;

  /**
   * The optional description.
   */
  readonly description: string;

  /**
   * The allowed values for string.
   */
  readonly allowedValues?: string[];

  /**
   * The minimum length.
   */
  readonly minLength?: number;

  /**
   * The maximum length.
   */
  readonly maxLength?: number;
}

export class ResourceDescriptor {
  /**
   * The unique identifier.
   */
  readonly name: string;

  /**
   * The description for the resource.
   */
  readonly description: string;

  /**
   * The available parameters.
   */
  readonly parameters: Record<string, ResourceParameterDescriptor>;
}

export interface ResourceRequest {
  /**
   * The parameters.
   */
  readonly parameters: Record<string, boolean | number | string | null>;
}

export interface ResourceApplyResult {
  /**
   * The context values that will be added or overwritten to the deployment.
   */
  readonly context: Record<string, string>;

  /**
   * The output.
   */
  readonly log?: string;
}

export interface ResourceNodeStatus {
  /**
   * The name of the node.
   */
  readonly name: string;

  /**
   * Indicates if the node can be used.
   */
  readonly isReady: boolean;

  /**
   * The message to describe the status.
   */
  readonly message?: string;
}

export interface ResourceWorkloadStatus {
  /**
   * The name of the workload.
   */
  readonly name: string;

  /**
   * All nodes within the workload.
   */
  readonly nodes: ResourceNodeStatus[];
}

export class ResourceStatusResult {
  /**
   * The workflows that have been created.
   */
  readonly workloads: ResourceWorkloadStatus[] = [];
}

export interface Resource {
  descriptor: ResourceDescriptor;

  apply(id: string, request: ResourceRequest): Promise<ResourceApplyResult>;

  delete(id: string, request: ResourceRequest): Promise<void>;

  status(id: string, request: ResourceRequest): Promise<ResourceStatusResult>;
}

export const RESOURCE_TOKEN = 'RESOURCE';
