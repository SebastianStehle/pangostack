import { ProgressReporter, SubStep } from 'src/resources/interface';

export function formatReadiness(ready: number, total: number, unit: string, waitingFor: string[]) {
  let message = `${ready}/${total} ${unit} ready`;

  if (waitingFor.length > 0) {
    message += ` (waiting for: ${waitingFor.join(', ')})`;
  }

  return message;
}

export class ProgressTracker implements ProgressReporter {
  readonly subSteps: SubStep[] = [];

  constructor(private readonly onChange: (subSteps: SubStep[]) => void) {}

  private get current(): SubStep | undefined {
    return this.subSteps[this.subSteps.length - 1];
  }

  beginStep(name: string) {
    this.finishCurrent('Completed');

    this.subSteps.push({ name, status: 'Running', startedAt: new Date().toISOString() });
    this.onChange(this.subSteps);
  }

  update(message: string) {
    const current = this.current;
    if (!current || current.status !== 'Running') {
      return;
    }

    current.message = message;
    this.onChange(this.subSteps);
  }

  complete() {
    this.finishCurrent('Completed');
  }

  fail(message?: string) {
    this.finishCurrent('Failed', message);
  }

  private finishCurrent(status: 'Completed' | 'Failed', message?: string) {
    const current = this.current;
    if (!current || current.status !== 'Running') {
      return;
    }

    current.status = status;
    current.completedAt = new Date().toISOString();

    if (message) {
      current.message = message;
    }

    this.onChange(this.subSteps);
  }
}
