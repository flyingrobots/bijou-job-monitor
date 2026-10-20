// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import { Job } from './job.js';
import type { Effect, MonitorEvent } from './protocol.js';
interface Snapshot {
  readonly jobs: readonly Job[];
  readonly selected: string;
  readonly failuresOnly: boolean;
  readonly confirming: boolean;
  readonly screen: 'jobs' | 'logs';
  readonly epoch: number;
  readonly detail: string;
}
export interface Transition { readonly model: Monitor; readonly effects: readonly Effect[] }
export class Monitor implements Snapshot {
  public readonly jobs: readonly Job[];
  public readonly selected: string;
  public readonly failuresOnly: boolean;
  public readonly confirming: boolean;
  public readonly screen: 'jobs' | 'logs';
  public readonly epoch: number;
  public readonly detail: string;
  public constructor(snapshot: Snapshot) {
    if (snapshot.jobs.length === 0 || !snapshot.jobs.some(job => job.id === snapshot.selected)) throw new Error('Selection must identify a job');
    if (new Set(snapshot.jobs.map(job => job.id)).size !== snapshot.jobs.length) throw new Error('Job IDs must be unique');
    this.jobs = Object.freeze([...snapshot.jobs]); this.selected = snapshot.selected;
    this.failuresOnly = snapshot.failuresOnly; this.confirming = snapshot.confirming;
    this.screen = snapshot.screen; this.epoch = snapshot.epoch; this.detail = snapshot.detail;
    Object.freeze(this);
  }
  public static initial(): Monitor {
    return new Monitor({ jobs: [new Job('compile', 'Compile the application'), new Job('test', 'Run the tests'), new Job('publish', 'Publish the package')], selected: 'compile', failuresOnly: false, confirming: false, screen: 'jobs', epoch: 0, detail: '' });
  }
  public get visibleJobs(): readonly Job[] { return this.jobs.filter(job => !this.failuresOnly || job.status === 'failed'); }
  private change(patch: Partial<Snapshot>, effects: readonly Effect[] = []): Transition {
    return { model: new Monitor({ ...this, ...patch }), effects };
  }
  private replace(job: Job, effects: readonly Effect[] = []): Transition {
    return this.change({ jobs: this.jobs.map(current => current.id === job.id ? job : current) }, effects);
  }
  public update(event: MonitorEvent): Transition {
    // The dialog owns keyboard intentions; worker results can still update jobs.
    if (this.confirming && ['move', 'filter', 'start', 'logs', 'ask-cancel'].includes(event.type)) return { model: this, effects: [] };
    const selected = this.jobs.find(job => job.id === this.selected);
    if (!selected) throw new Error('Invalid monitor selection');
    switch (event.type) {
      case 'move': {
        const visible = this.visibleJobs;
        if (!visible.length) return { model: this, effects: [] };
        const index = Math.max(0, visible.findIndex(job => job.id === this.selected));
        const next = visible[(index + event.delta % visible.length + visible.length) % visible.length];
        if (!next) return { model: this, effects: [] };
        const epoch = this.epoch + 1;
        return this.change({ selected: next.id, epoch, detail: '' }, this.screen === 'logs' ? [{ type: 'abort-logs' }, { type: 'load-logs', id: next.id, epoch }] : []);
      }
      case 'filter': {
        const failuresOnly = !this.failuresOnly;
        const first = this.jobs.find(job => !failuresOnly || job.status === 'failed');
        return this.change({ failuresOnly, selected: first?.id ?? this.selected, screen: 'jobs', epoch: this.epoch + 1, detail: '' }, [{ type: 'abort-logs' }]);
      }
      case 'start': {
        if (selected.status === 'running' || !this.visibleJobs.some(job => job.id === selected.id)) return { model: this, effects: [] };
        const started = selected.start();
        return this.replace(started, [{ type: 'run', id: started.id, run: started.run }]);
      }
      case 'ask-cancel': return selected.status === 'running' && this.visibleJobs.some(job => job.id === selected.id) ? this.change({ confirming: true }) : { model: this, effects: [] };
      case 'confirm-cancel': return this.confirming && selected.status !== 'running' ? this.change({ confirming: false }) : this.confirming ? this.change({ confirming: false, jobs: this.jobs.map(job => job.id === selected.id ? job.cancel() : job) }, [{ type: 'abort', id: selected.id }]) : { model: this, effects: [] };
      case 'dismiss': return this.confirming ? this.change({ confirming: false }) : this.change({ screen: 'jobs', detail: '', epoch: this.epoch + 1 }, [{ type: 'abort-logs' }]);
      case 'logs': {
        const epoch = this.epoch + 1;
        return this.change({ screen: 'logs', detail: '', epoch }, [{ type: 'abort-logs' }, { type: 'load-logs', id: selected.id, epoch }]);
      }
      case 'logs-loaded': return this.screen === 'logs' && event.id === this.selected && event.epoch === this.epoch ? this.change({ detail: event.text }) : { model: this, effects: [] };
      case 'progress': {
        const job = this.jobs.find(item => item.id === event.id);
        return job?.status === 'running' && job.run === event.run ? this.replace(new Job(job.id, job.title, 'running', Math.max(job.percent, event.percent), job.run)) : { model: this, effects: [] };
      }
      case 'done': {
        const job = this.jobs.find(item => item.id === event.id);
        return job?.status === 'running' && job.run === event.run ? this.replace(new Job(job.id, job.title, event.error ? 'failed' : 'succeeded', event.error ? job.percent : 100, job.run, event.error)) : { model: this, effects: [] };
      }
    }
  }
}
