// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import { createNodeContext } from '@flyingrobots/bijou-node';
import { present, wrapCells } from '../src/presentation.js';
import { Monitor } from '../src/monitor.js';
import { exampleSnapshot } from '../src/fixtures.js';
const checkpoint = process.argv[2] ?? '01'; const ctx = createNodeContext();
switch (checkpoint) {
  case '01': console.log(present(Monitor.initial(), { ...ctx, mode: 'static' }, 80)); break;
  case '02': for (const mode of ['interactive', 'static', 'pipe', 'accessible'] as const) { console.log('\n' + mode.toUpperCase()); console.log(present(exampleSnapshot(), { ...ctx, mode }, 40)); } break;
  case '03': await import('../src/main.js'); break;
  case '04': {
    const old = Monitor.initial().update({ type: 'logs' }).model;
    const current = old.update({ type: 'move', delta: 1 }).model;
    const stale = current.update({ type: 'logs-loaded', id: old.selected, epoch: old.epoch, text: 'stale' }).model;
    assert.equal(stale.detail, ''); console.log('Late log result rejected. Selected job:', stale.selected); break;
  }
  case '05': console.log(wrapCells(present(exampleSnapshot(), { ...ctx, mode: 'static' }, 24, 'long'), 24).join('\n')); break;
  default: throw new Error('Choose checkpoint 01, 02, 03, 04, or 05');
}
