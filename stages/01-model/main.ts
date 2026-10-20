// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import { Monitor } from './monitor.js';
import { present } from './presentation.js';
process.stdout.write(present(Monitor.initial()) + '\n');
