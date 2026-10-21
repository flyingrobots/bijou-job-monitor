// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import { stageDirectory } from './stage.js';
const directory = stageDirectory(process.argv[2]);
await import(new URL('./' + directory + '/main.js', import.meta.url).href);
