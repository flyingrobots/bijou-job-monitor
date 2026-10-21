// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import { Job } from './job.js';
export class Monitor {
  public readonly jobs: readonly Job[];
  public constructor(jobs: readonly Job[], public readonly selected: string) {
    if (!jobs.length || !jobs.some(job => job.id === selected)) throw new Error('Selection must identify a job');
    if (new Set(jobs.map(job => job.id)).size !== jobs.length) throw new Error('Job IDs must be unique');
    this.jobs = Object.freeze([...jobs]); Object.freeze(this);
  }
  public static initial(): Monitor {
    return new Monitor([new Job('compile', 'Compile the application'), new Job('test', 'Run the tests'), new Job('publish', 'Publish the package')], 'compile');
  }
  public get visibleJobs(): readonly Job[] { return this.jobs; }
}
