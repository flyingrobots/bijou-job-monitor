// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import type { Monitor } from './monitor.js';
export function present(model: Monitor): string {
  return model.jobs.map(job => `${job.id}: ${job.status} ${job.percent}%`).join('\n');
}
