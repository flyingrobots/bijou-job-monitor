// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import { readFileSync } from 'node:fs';
import { stageDirectory } from './stage.js';
const before = stageDirectory(process.argv[2]); const after = stageDirectory(process.argv[3]);
if (Number(after.slice(0,2)) !== Number(before.slice(0,2)) + 1) throw new Error('Choose adjacent forward stages, such as 01 02');
process.stdout.write(readFileSync(new URL('./diffs/' + before + '--' + after + '.patch', import.meta.url), 'utf8'));
