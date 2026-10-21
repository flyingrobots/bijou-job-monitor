// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import { createNodeContext } from '@flyingrobots/bijou-node';
import { exampleSnapshot } from './fixtures.js';
import { present } from './presentation.js';
const ctx = createNodeContext();
for (const mode of ['interactive', 'static', 'pipe', 'accessible'] as const) {
  process.stdout.write('\n' + mode.toUpperCase() + ' content specimen\n');
  process.stdout.write(present(exampleSnapshot(), { ...ctx, mode }, 80) + '\n');
}
