// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import { table, stringToSurface, stripAnsi, type BijouContext, type Surface } from '@flyingrobots/bijou';
import { Monitor } from './monitor.js';
export function present(model: Monitor, ctx: BijouContext, width: number, locale: 'en' | 'long' = 'en'): string {
  const title = locale === 'long' ? 'Job monitor — ausführliche Übersetzung für schmale Fenster' : 'Job monitor';
  const jobs = model.visibleJobs;
  const rows = jobs.map(job => [job.id === model.selected ? '> ' + job.title : job.title, job.status, String(job.percent) + '%']);
  if (ctx.mode === 'pipe') return table({ columns: [{ header: 'id' }, { header: 'status' }, { header: 'progress' }, { header: 'error' }], rows: jobs.map(job => [job.id, job.status, String(job.percent), job.error ?? '']), ctx });
  if (ctx.mode === 'accessible') return [title, jobs.length ? '' : 'No jobs match the filter.', ...jobs.map(job => `${job.id === model.selected ? 'Selected. ' : ''}${job.title}. Status: ${job.status}. Progress: ${job.percent} percent.${job.error ? ' Error: ' + job.error : ''}`), model.screen === 'logs' ? `Logs for ${model.selected}. ${model.detail || 'Loading logs.'}` : '', model.confirming ? `Cancel ${model.selected}? Enter confirms. Escape keeps it running.` : 'Up and Down select. Enter starts. C opens cancellation. L opens logs. F filters failures. Q quits.'].filter(Boolean).join('\n');
  const data = table({ columns: [{ header: 'Job' }, { header: 'Status' }, { header: 'Progress' }], rows, width, wrap: 'word', ctx });
  const detail = model.screen === 'logs' ? `Logs / ${model.selected}\n${model.detail || 'Loading logs…'}` : 'Up/Down: select · Enter: start · c: cancel · l: logs · f: failures · q: quit';
  const dialog = model.confirming ? `Cancel ${model.selected}?\nEnter: cancel job · Escape: keep running` : '';
  if (model.confirming) return [title, dialog, `Selected: ${model.selected}. Status: ${model.jobs.find(job => job.id === model.selected)?.status}`].join('\n\n');
  const failures = jobs.filter(job => job.error).map(job => `${job.id}: ${job.error}`).join('\n');
  return [title, model.failuresOnly ? 'Filter: failures' : 'Filter: all jobs', data || 'No jobs match the filter.', detail, failures].filter(Boolean).join('\n\n');
}
export function view(model: Monitor, ctx: BijouContext, width: number, height: number): Surface {
  if (width < 80 || height < 32) return stringToSurface('Resize to 80 x 32. Q quits.', width, height);
  return stringToSurface(stripAnsi(present(model, ctx, width)), width, height);
}
