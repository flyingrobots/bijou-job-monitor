// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import { table, stringToSurface, stripAnsi, type Surface, type BijouContext } from '@flyingrobots/bijou';
import type { Monitor } from './monitor.js';
export function present(model: Monitor, ctx: BijouContext, width: number): string {
  const jobs = model.visibleJobs;
  if (model.confirming) return `Cancel ${model.selected}? Enter confirms. Escape keeps it running.`;
  if (ctx.mode === 'pipe') return table({ columns: [{ header: 'id' }, { header: 'status' }, { header: 'progress' }, { header: 'error' }], rows: jobs.map(job => [job.id, job.status, String(job.percent), job.error ?? '']), ctx });
  if (ctx.mode === 'accessible') return jobs.map(job => `${job.id === model.selected ? 'Selected. ' : ''}${job.title}. Status: ${job.status}. Progress: ${job.percent} percent.${job.error ? ' Error: ' + job.error : ''}`).join('\n');
  return ['Job monitor', table({ columns: [{ header: 'Job' }, { header: 'Status' }, { header: 'Progress' }], rows: jobs.map(job => [job.id === model.selected ? '> ' + job.title : job.title, job.status, String(job.percent) + '%']), width, wrap: 'word', ctx }), ...jobs.filter(job => job.error).map(job => `${job.id}: ${job.error}`)].join('\n');
}
export function view(model: Monitor, ctx: BijouContext, width: number, height: number): Surface {
  if (width < 80 || height < 24) return stringToSurface('Resize to 80 x 24. Q quits.', width, height);
  return stringToSurface(stripAnsi(present(model, ctx, width)) + '\nUp/Down: select. Enter: start. C: cancel. Q: quit.', width, height);
}
