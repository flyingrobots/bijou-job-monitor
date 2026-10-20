// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import { Job } from './job.js';
import type { MonitorEvent } from './protocol.js';
export class Monitor {
  public readonly jobs: readonly Job[];
  public constructor(jobs: readonly Job[], public readonly selected: string, public readonly confirming = false) {
    if (!jobs.length || !jobs.some(job => job.id === selected)) throw new Error('Selection must identify a job');
    if (new Set(jobs.map(job => job.id)).size !== jobs.length) throw new Error('Job IDs must be unique');
    this.jobs = Object.freeze([...jobs]); Object.freeze(this);
  }
  public static initial(): Monitor {
    return new Monitor([new Job('compile', 'Compile the application'), new Job('test', 'Run the tests'), new Job('publish', 'Publish the package')], 'compile');
  }
  public update(event: MonitorEvent): Monitor {
    if (this.confirming && (event.type === 'move' || event.type === 'start' || event.type === 'ask-cancel')) return this;
    const job = this.jobs.find(item => item.id === this.selected);
    if (!job) throw new Error('Invalid selection');
    switch (event.type) {
      case 'move': {
        const index = this.jobs.findIndex(item => item.id === this.selected);
        const next = this.jobs[(index + event.delta % this.jobs.length + this.jobs.length) % this.jobs.length];
        return next ? new Monitor(this.jobs, next.id) : this;
      }
      case 'start': return job.status === 'running' ? this : new Monitor(this.jobs.map(item => item.id === job.id ? job.start() : item), this.selected);
      case 'ask-cancel': return job.status === 'running' ? new Monitor(this.jobs, this.selected, true) : this;
      case 'confirm-cancel': return this.confirming ? new Monitor(this.jobs.map(item => item.id === job.id ? job.cancel() : item), this.selected) : this;
      case 'dismiss': return new Monitor(this.jobs, this.selected);
    }
  }
  public get visibleJobs(): readonly Job[] { return this.jobs; }
}
