// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createTestContext } from '@flyingrobots/bijou/adapters/test';
import { stripAnsi } from '@flyingrobots/bijou';
import { exampleSnapshot } from '../fixtures.js';
import { present } from '../presentation.js';
test('all four presentations preserve states, progress and failure explanation', () => {
  for (const mode of ['interactive', 'static', 'pipe', 'accessible'] as const) {
    const output = stripAnsi(present(exampleSnapshot(), createTestContext({ mode }), 80));
    for (const value of ['succeeded','failed','running','40','Fixture failure']) assert.ok(output.includes(value), mode + ': ' + value);
  }
});
test('pipe retains four fields including an empty error column', () => {
  const output = present(exampleSnapshot(), createTestContext({ mode: 'pipe' }), 80);
  assert.equal(output.split('\n')[0], 'id\tstatus\tprogress\terror');
  assert.ok(output.split('\n').every(line => line.split('\t').length === 4));
  assert.doesNotMatch(output, /\x1b/u);
});
