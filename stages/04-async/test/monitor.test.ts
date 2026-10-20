// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import { test } from 'vitest';
import assert from 'node:assert/strict';
import { Job } from '../job.js';
import { Monitor } from '../monitor.js';
import { EffectDriver, type SchedulePort } from '../effects.js';
import type { MonitorEvent } from '../protocol.js';
class ManualScheduler implements SchedulePort {
  public now = 0;
  private entries: { at: number; callback: () => void; active: boolean }[] = [];
  public after(milliseconds: number, callback: () => void): () => void {
    const entry = { at: this.now + milliseconds, callback, active: true }; this.entries.push(entry);
    return () => { entry.active = false; };
  }
  public advance(milliseconds: number): void {
    const end = this.now + milliseconds;
    while (true) {
      const first = this.entries.filter(entry => entry.active && entry.at <= end).sort((a, b) => a.at - b.at)[0];
      if (!first) break; this.now = first.at; first.active = false; first.callback();
    }
    this.now = end;
  }
}
test('starting a job creates a new run and progress is monotonic', () => {
  const started = Monitor.initial().update({ type: 'start' });
  assert.equal(started.model.jobs[0]?.status, 'running'); assert.equal(started.effects[0]?.type, 'run');
  const progressed = started.model.update({ type: 'progress', id: 'compile', run: 1, percent: 60 }).model;
  assert.equal(progressed.update({ type: 'progress', id: 'compile', run: 1, percent: 20 }).model.jobs[0]?.percent, 60);
  assert.equal(progressed.update({ type: 'done', id: 'compile', run: 1 }).model.jobs[0]?.status, 'succeeded');
});
test('the confirmation dialog owns movement and Escape dismisses without cancellation', () => {
  const model = Monitor.initial().update({ type: 'start' }).model.update({ type: 'ask-cancel' }).model;
  assert.equal(model.update({ type: 'move', delta: 1 }).model.selected, 'compile');
  const dismissed = model.update({ type: 'dismiss' });
  assert.equal(dismissed.model.confirming, false); assert.equal(dismissed.model.jobs[0]?.status, 'running'); assert.deepEqual(dismissed.effects, []);
});
test('confirmed cancellation rejects a late completion and a previous run after restart', () => {
  const model = Monitor.initial().update({ type: 'start' }).model.update({ type: 'ask-cancel' }).model;
  const cancelled = model.update({ type: 'confirm-cancel' }).model;
  assert.equal(cancelled.update({ type: 'done', id: 'compile', run: 1 }).model.jobs[0]?.status, 'cancelled');
  const restarted = cancelled.update({ type: 'start' }).model;
  assert.equal(restarted.update({ type: 'done', id: 'compile', run: 1 }).model.jobs[0]?.status, 'running');
});
test('late logs cannot replace a newly selected job or reopen a closed screen', () => {
  const logs = Monitor.initial().update({ type: 'logs' }).model;
  const selected = logs.update({ type: 'move', delta: 1 }).model;
  assert.equal(selected.update({ type: 'logs-loaded', id: 'compile', epoch: logs.epoch, text: 'WRONG' }).model.detail, '');
  const loaded = selected.update({ type: 'logs-loaded', id: 'test', epoch: selected.epoch, text: 'right log' }).model;
  assert.equal(loaded.detail, 'right log');
  assert.equal(loaded.update({ type: 'dismiss' }).model.update({ type: 'logs-loaded', id: 'test', epoch: loaded.epoch, text: 'LATE' }).model.screen, 'jobs');
});
test('the asynchronous driver completes, fails, cancels and stops after disposal', () => {
  const scheduler = new ManualScheduler(); const driver = new EffectDriver(scheduler); const events: MonitorEvent[] = [];
  driver.execute({ type: 'run', id: 'compile', run: 1 }, event => events.push(event));
  driver.execute({ type: 'run', id: 'test', run: 1 }, event => events.push(event));
  scheduler.advance(500);
  assert.ok(events.some(event => event.type === 'done' && event.id === 'compile' && !event.error));
  assert.ok(events.some(event => event.type === 'done' && event.id === 'test' && event.error));
  driver.execute({ type: 'run', id: 'publish', run: 1 }, event => events.push(event));
  driver.execute({ type: 'abort', id: 'publish' }, event => events.push(event));
  const count = events.length; scheduler.advance(1000); assert.equal(events.length, count);
  driver.execute({ type: 'load-logs', id: 'compile', epoch: 1 }, event => events.push(event));
  driver.dispose(); scheduler.advance(1000); assert.equal(events.length, count);
});
test('empty filters preserve selection identity and cannot start hidden work', () => {
  const filtered = Monitor.initial().update({ type: 'filter' }).model;
  assert.equal(filtered.visibleJobs.length, 0); assert.equal(filtered.update({ type: 'start' }).effects.length, 0);
});
test('job invariants reject impossible progress and duplicate identities', () => {
  assert.throws(() => new Job('x', 'X', 'running', 101));
  assert.throws(() => new Job('x', 'X', 'succeeded', 0));
  assert.throws(() => new Monitor({ ...Monitor.initial(), jobs: [new Job('x', 'X'), new Job('x', 'X')], selected: 'x' }));
});
test('completion during confirmation cannot be turned into cancellation', () => {
  const model = Monitor.initial().update({ type: 'start' }).model.update({ type: 'ask-cancel' }).model.update({ type: 'done', id: 'compile', run: 1 }).model;
  const confirmed = model.update({ type: 'confirm-cancel' });
  assert.equal(confirmed.model.jobs[0]?.status, 'succeeded'); assert.equal(confirmed.model.confirming, false); assert.deepEqual(confirmed.effects, []);
});
