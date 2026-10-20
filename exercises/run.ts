// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
// INTENTIONALLY BROKEN teaching fixtures. --repair selects the production path.
import assert from 'node:assert/strict';
import { createNodeContext } from '@flyingrobots/bijou-node';
import { stripAnsi } from '@flyingrobots/bijou';
import { Monitor } from '../src/monitor.js';
import { EffectDriver } from '../src/effects.js';
import { exampleSnapshot } from '../src/fixtures.js';
import { present } from '../src/presentation.js';
const repair = process.argv.includes('--repair'); const exercise = process.argv[2];
switch (exercise) {
  case 'modal': {
    const dialog = Monitor.initial().update({ type: 'start' }).model.update({ type: 'ask-cancel' }).model;
    const next = (repair ? dialog : new Monitor({ ...dialog, confirming: false })).update({ type: 'move', delta: 1 }).model;
    assert.equal(next.selected, dialog.selected, 'The dialog must own movement; the job behind it moved'); break;
  }
  case 'stale': {
    const old = Monitor.initial().update({ type: 'logs' }).model;
    const current = old.update({ type: 'move', delta: 1 }).model;
    const late = { type: 'logs-loaded' as const, id: old.selected, epoch: old.epoch, text: 'WRONG JOB LOG' };
    const next = repair ? current.update(late).model : new Monitor({ ...current, detail: late.text });
    assert.equal(next.detail, '', 'A stale completion replaced the selected job’s detail'); break;
  }
  case 'color': {
    const ctx = createNodeContext();
    const output = repair ? present(exampleSnapshot(), { ...ctx, mode: 'static' }, 80) : '\x1b[31m●\x1b[0m test';
    assert.match(stripAnsi(output), /failed/u, 'Color removal erased the meaning of failure'); break;
  }
  case 'timer': {
    const callbacks: (() => void)[] = []; const events: string[] = [];
    const driver = new EffectDriver({ after: (_delay, callback) => { let active = true; callbacks.push(() => { if (active) callback(); }); return () => { active = false; }; } });
    driver.execute({ type: 'run', id: 'compile', run: 1 }, event => events.push(event.type));
    if (repair) driver.dispose();
    callbacks.shift()?.();
    assert.deepEqual(events, [], 'A closed screen still produced progress frames'); driver.dispose(); break;
  }
  default: throw new Error('Choose modal, stale, color, or timer; add --repair to verify the repair');
}
console.log('Success criterion met:', exercise);
