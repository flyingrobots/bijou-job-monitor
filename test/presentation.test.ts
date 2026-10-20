// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import { test } from 'vitest';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createTestContext } from '@flyingrobots/bijou/adapters/test';
import { graphemeWidth, stripAnsi, surfaceToString } from '@flyingrobots/bijou';
import { present, view, wrapCells } from '../src/presentation.js';
import { exampleSnapshot } from '../src/fixtures.js';
import { Monitor } from '../src/monitor.js';
import { createMonitorApp } from '../src/app.js';
import { EffectDriver } from '../src/effects.js';
const snapshot = exampleSnapshot();
test('four modes preserve job identity, textual state and progress', () => {
  for (const mode of ['interactive', 'static', 'pipe', 'accessible'] as const) {
    const output = stripAnsi(present(snapshot, createTestContext({ mode }), 80));
    assert.match(output, /succeeded/u); assert.match(output, /failed/u); assert.match(output, /running/u); assert.match(output, /40/u);
    assert.match(output, /Fixture failure/u);
  }
});
test('pipe output is TSV with stable headers, no control sequences or UI', () => {
  const output = present(snapshot, createTestContext({ mode: 'pipe' }), 80);
  const lines = output.split('\n'); assert.equal(lines[0], 'id\tstatus\tprogress\terror');
  assert.equal(lines.length, 4); assert.ok(lines.every(line => line.split('\t').length === 4)); assert.doesNotMatch(output, /\x1b|Up\/Down|Job monitor/u);
});
test('accessible output spells out selection, failure and cancellation ownership', () => {
  const model = Monitor.initial().update({ type: 'start' }).model.update({ type: 'ask-cancel' }).model;
  const output = present(model, createTestContext({ mode: 'accessible' }), 80);
  assert.match(output, /Selected\. Compile/u); assert.match(output, /Enter confirms\. Escape keeps it running/u);
});
test('Unicode and long copy remain within cell bounds at constrained dimensions', () => {
  for (const width of [1, 2, 12, 24, 40, 80]) {
    const long = present(snapshot, createTestContext({ mode: 'static' }), width, 'long');
    for (const line of wrapCells(long + '\n界 é 👩‍💻', width)) assert.ok(graphemeWidth(line) <= width, `${width}: ${line}`);
    for (const height of [1, 4, 8, 24]) { const frame = view(snapshot, createTestContext({ mode: 'interactive' }), width, height); assert.equal(frame.width, width); assert.equal(frame.height, height); }
  }
});
test('narrow views retain all job identities in their scrollable text, with errors', () => {
  const output = present(snapshot, createTestContext({ mode: 'static' }), 24);
  assert.match(output, /compile: succeeded/u); assert.match(output, /test: failed/u); assert.match(output, /publish: running/u); assert.match(output, /Fixture failure/u);
});
test('real App routes Enter, dialog Escape, resize and q to a Surface or quit command', () => {
  const ctx = createTestContext({ mode: 'interactive', runtime: { columns: 80, rows: 24 } });
  const driver = new EffectDriver({ after: () => () => undefined }); const app = createMonitorApp(ctx, driver);
  let [model] = app.init(); [model] = app.update({ type: 'key', key: 'enter', ctrl: false, alt: false, shift: false }, model);
  assert.equal(model.monitor.jobs[0]?.status, 'running');
  [model] = app.update({ type: 'key', key: 'c', ctrl: false, alt: false, shift: false }, model);
  const dialog = app.view(model); assert.ok('get' in dialog);
  assert.match(Array.from({ length: dialog.height }, (_, y) => Array.from({ length: dialog.width }, (_, x) => dialog.get(x,y).char).join('')).join('\n'), /Cancel compile/u);
  [model] = app.update({ type: 'key', key: 'escape', ctrl: false, alt: false, shift: false }, model);
  assert.equal(model.monitor.jobs[0]?.status, 'running');
  [model] = app.update({ type: 'resize', columns: 24, rows: 8 }, model);
  const frame = app.view(model); assert.ok('get' in frame); assert.equal(frame.width, 24); assert.equal(frame.height, 8);
  const [, commands] = app.update({ type: 'key', key: 'q', ctrl: false, alt: false, shift: false }, model); assert.equal(commands.length, 1);
});
test('CLI redirected output is TSV; explicit static and accessible work without a TTY', () => {
  for (const mode of ['pipe', 'static', 'accessible']) {
    const result = spawnSync(process.execPath, ['--import', 'tsx', 'src/main.ts', '--mode=' + mode], { cwd: process.cwd(), encoding: 'utf8', timeout: 5000, env: { ...process.env, NO_COLOR: '1' } });
    assert.equal(result.status, 0, result.stderr); assert.match(result.stdout, /failed/u); assert.doesNotMatch(result.stdout, /\x1b/u);
  }
});
