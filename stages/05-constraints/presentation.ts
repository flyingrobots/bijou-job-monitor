// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import { table, stringToSurface, graphemeClusterWidth, stripAnsi, type BijouContext, type Surface } from '@flyingrobots/bijou';
import { Monitor } from './monitor.js';
export function present(model: Monitor, ctx: BijouContext, width: number, locale: 'en' | 'long' = 'en'): string {
  const title = locale === 'long' ? 'Job monitor — ausführliche Übersetzung für schmale Fenster' : 'Job monitor';
  const jobs = model.visibleJobs;
  const rows = jobs.map(job => [job.id === model.selected ? '> ' + job.title : job.title, job.status, String(job.percent) + '%']);
  if (ctx.mode === 'pipe') return table({ columns: [{ header: 'id' }, { header: 'status' }, { header: 'progress' }, { header: 'error' }], rows: jobs.map(job => [job.id, job.status, String(job.percent), job.error ?? '']), ctx });
  if (ctx.mode === 'accessible') return [title, jobs.length ? '' : 'No jobs match the filter.', ...jobs.map(job => `${job.id === model.selected ? 'Selected. ' : ''}${job.title}. Status: ${job.status}. Progress: ${job.percent} percent.${job.error ? ' Error: ' + job.error : ''}`), model.screen === 'logs' ? `Logs for ${model.selected}. ${model.detail || 'Loading logs.'}` : '', model.confirming ? `Cancel ${model.selected}? Enter confirms. Escape keeps it running.` : 'Up and Down select. Enter starts. C opens cancellation. L opens logs. F filters failures. Q quits.'].filter(Boolean).join('\n');
  const narrow = width < 42;
  const data = narrow ? jobs.map(job => `${job.id === model.selected ? '> ' : '  '}${job.id}: ${job.status} ${job.percent}%${job.error ? '\n  ' + job.error : ''}`).join('\n') : table({ columns: [{ header: 'Job' }, { header: 'Status' }, { header: 'Progress' }], rows, width, wrap: 'word', ctx });
  const detail = model.screen === 'logs' ? `Logs / ${model.selected}\n${model.detail || 'Loading logs…'}` : 'Up/Down: select · Enter: start · c: cancel · l: logs · f: failures · q: quit';
  const dialog = model.confirming ? `Cancel ${model.selected}?\nEnter: cancel job · Escape: keep running` : '';
  if (model.confirming) return [title, dialog, `Selected: ${model.selected}. Status: ${model.jobs.find(job => job.id === model.selected)?.status}`].join('\n\n');
  const failures = jobs.filter(job => job.error).map(job => `${job.id}: ${job.error}`).join('\n');
  return [title, model.failuresOnly ? 'Filter: failures' : 'Filter: all jobs', data || 'No jobs match the filter.', detail, failures].filter(Boolean).join('\n\n');
}
export function wrapCells(text: string, width: number): string[] {
  if (!Number.isInteger(width) || width < 1) throw new Error('Width must be a positive integer');
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  return text.split('\n').flatMap(line => {
    const result: string[] = []; let current = ''; let used = 0;
    for (const { segment } of segmenter.segment(line)) {
      const cells = graphemeClusterWidth(segment);
      if (cells > width) { if (current) result.push(current); result.push('?'); current = ''; used = 0; continue; }
      if (used + cells > width) { result.push(current); current = ''; used = 0; }
      current += segment; used += cells;
    }
    result.push(current); return result;
  });
}
export function view(model: Monitor, ctx: BijouContext, width: number, height: number, offset = 0): Surface {
  const lines = wrapCells(stripAnsi(present(model, ctx, width)), width);
  const top = height >= 7 ? lines.slice(0, 4) : lines.slice(0, 1);
  const footer = `j/k scroll · q quit | ${offset + 1}/${Math.max(1, lines.length - top.length)}`;
  const contentHeight = Math.max(0, height - top.length - 1);
  const selectedLine = lines.findIndex(line => line.includes('> ' + model.selected + ':') || line.includes('> ' + (model.jobs.find(job => job.id === model.selected)?.title ?? '')));
  const focusOffset = offset === 0 && selectedLine >= top.length + contentHeight ? Math.max(0, selectedLine - top.length - contentHeight + 1) : offset;
  const boundedOffset = Math.min(focusOffset, Math.max(0, lines.length - top.length - contentHeight));
  const body = lines.slice(top.length + boundedOffset, top.length + boundedOffset + contentHeight);
  return stringToSurface([...top, ...body, ...Array.from({ length: Math.max(0, contentHeight - body.length) }, () => ''), ...wrapCells(footer, width).slice(0, 1)].slice(0, height).join('\n'), width, height);
}
