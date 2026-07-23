import { Logger } from '@nestjs/common';
import { ConnectionInfo, ParametersOrContextValue, ResourceEvent, ResourceReporter } from 'src/resources/interface';

export function formatReadiness(ready: number, total: number, unit: string, waitingFor: string[]) {
  let message = `${ready}/${total} ${unit} ready`;

  if (waitingFor.length > 0) {
    message += ` (waiting for: ${waitingFor.join(', ')})`;
  }

  return message;
}

export class ResourceReporterImpl implements ResourceReporter {
  private stepCounter = 0;
  private currentStepId?: string;

  constructor(
    private readonly emit: (event: ResourceEvent) => void,
    private readonly logger?: Logger,
  ) {}

  beginStep(name: string) {
    this.completeCurrent();

    const id = `${++this.stepCounter}`;
    this.currentStepId = id;
    this.emit({ type: 'startStep', id, name, timestamp: new Date() });
  }

  report(message: string, options?: { log?: boolean }) {
    this.emit({ type: 'appendLog', stepId: this.currentStepId ?? null, message, timestamp: new Date() });

    if (options?.log) {
      this.logger?.log(message);
    }
  }

  appendContext(context: Record<string, ParametersOrContextValue>) {
    this.emit({ type: 'appendContext', context, timestamp: new Date() });
  }

  appendResourceContext(context: Record<string, string>) {
    this.emit({ type: 'appendResourceContext', context, timestamp: new Date() });
  }

  appendConnection(connection: Record<string, ConnectionInfo>) {
    this.emit({ type: 'appendConnection', connection, timestamp: new Date() });
  }

  complete() {
    this.completeCurrent();
  }

  fail(message?: string) {
    if (!this.currentStepId) {
      return;
    }

    this.emit({ type: 'failStep', id: this.currentStepId, message: message ?? null, timestamp: new Date() });
    this.currentStepId = undefined;
  }

  private completeCurrent() {
    if (!this.currentStepId) {
      return;
    }

    this.emit({ type: 'completeStep', id: this.currentStepId, timestamp: new Date() });
    this.currentStepId = undefined;
  }
}
