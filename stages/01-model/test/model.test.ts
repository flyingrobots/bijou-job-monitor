// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import { test } from 'vitest';
import assert from 'node:assert/strict';
import { Job } from '../job.js';
import { Monitor } from '../monitor.js';
test('queued snapshot has stable identities and runtime immutability', () => {
  const model = Monitor.initial(); assert.deepEqual(model.jobs.map(job => job.id), ['compile', 'test', 'publish']);
  assert.ok(model.jobs.every(job => job.status === 'queued' && job.percent === 0));
  assert.ok(Object.isFrozen(model)); assert.ok(Object.isFrozen(model.jobs)); assert.ok(Object.isFrozen(model.jobs[0]));
});
test('impossible progress and duplicate identities are rejected', () => {
  assert.throws(() => new Job('x', 'X', 'running', 101));
  assert.throws(() => new Monitor([new Job('x', 'X'), new Job('x', 'Other')], 'x'));
});
