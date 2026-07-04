// Dedicated Progress Event-Listener Pattern class to enable granular progress updates
// and prevent UI freeze during long-running tasks.

export interface ProgressPayload {
  percent: number;
  statusText: string;
  stepIndex?: number;
  filename?: string;
}

export class AnalysisProgressEmitter extends EventTarget {
  constructor() {
    super();
  }

  // Log message dispatched to subscribers
  log(message: string) {
    this.dispatchEvent(
      new CustomEvent<string>('log', {
        detail: message,
      })
    );
  }

  // Update stepper index or state
  step(stepIndex: number, text: string) {
    this.dispatchEvent(
      new CustomEvent<{ stepIndex: number; text: string }>('step', {
        detail: { stepIndex, text },
      })
    );
  }

  // Detailed granular progress inside a step
  progress(percent: number, statusText: string, filename?: string) {
    this.dispatchEvent(
      new CustomEvent<ProgressPayload>('progress', {
        detail: { percent, statusText, filename },
      })
    );
  }

  // Analysis successfully finalized
  complete(data: any) {
    this.dispatchEvent(
      new CustomEvent<any>('complete', {
        detail: data,
      })
    );
  }

  // Any errors during the scanning flow
  error(errMessage: string) {
    this.dispatchEvent(
      new CustomEvent<string>('error', {
        detail: errMessage,
      })
    );
  }
}
