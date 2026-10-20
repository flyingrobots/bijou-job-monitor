// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import { table, type BijouContext } from '@flyingrobots/bijou';
import type { Monitor } from './monitor.js';
export function present(model: Monitor, ctx: BijouContext, width: number): string {
  const jobs = model.visibleJobs;
  if (ctx.mode === 'pipe') return table({ columns: [{ header: 'id' }, { header: 'status' }, { header: 'progress' }, { header: 'error' }], rows: jobs.map(job => [job.id, job.status, String(job.percent), job.error ?? '']), ctx });
  if (ctx.mode === 'accessible') return jobs.map(job => `${job.id === model.selected ? 'Selected. ' : ''}${job.title}. Status: ${job.status}. Progress: ${job.percent} percent.${job.error ? ' Error: ' + job.error : ''}`).join('\n');
  return ['Job monitor', table({ columns: [{ header: 'Job' }, { header: 'Status' }, { header: 'Progress' }], rows: jobs.map(job => [job.id === model.selected ? '> ' + job.title : job.title, job.status, String(job.percent) + '%']), width, wrap: 'word', ctx }), ...jobs.filter(job => job.error).map(job => `${job.id}: ${job.error}`)].join('\n');
}
