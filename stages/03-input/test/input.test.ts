// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createTestContext } from '@flyingrobots/bijou/adapters/test';
import { createMonitorApp } from '../app.js';
import { view } from '../presentation.js';
import { Monitor } from '../monitor.js';
test('actual App routes start and keeps modal movement and Escape local', () => {
  const ctx = createTestContext({ mode: 'interactive', runtime: { columns: 80, rows: 24 } }); const app = createMonitorApp(ctx);
  let [model] = app.init();
  const key = (value: string): void => { [model] = app.update({ type:'key', key:value, ctrl:false, alt:false, shift:false }, model); };
  key('enter'); assert.equal(model.monitor.jobs[0]?.status, 'running');
  key('c'); key('down'); assert.equal(model.monitor.selected, 'compile');
  key('escape'); assert.equal(model.monitor.confirming, false); assert.equal(model.monitor.jobs[0]?.status,'running');
  key('c'); key('enter'); assert.equal(model.monitor.jobs[0]?.status,'cancelled');
});
test('resize below supported geometry shows recovery without changing the task', () => {
  const ctx = createTestContext({ mode: 'interactive' }); const model = Monitor.initial(); const frame = view(model, ctx, 40, 8);
  const text = Array.from({ length:frame.width },(_,x)=>frame.get(x,0).char).join('');
  assert.match(text,/Resize to 80 x 24/u); assert.equal(model.jobs[0]?.status,'queued');
});
