// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { stageDirectory } from './stage.js';
const directory = stageDirectory(process.argv[2]);
const root = fileURLToPath(new URL('../', import.meta.url));
const result = spawnSync(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', 'stages/' + directory + '/test/', '--maxWorkers=1'], { cwd: root, stdio: 'inherit', timeout: 60000 });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
