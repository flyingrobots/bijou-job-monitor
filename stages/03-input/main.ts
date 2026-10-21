// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import { createNodeContext } from '@flyingrobots/bijou-node';
import { run } from '@flyingrobots/bijou-tui';
import { createMonitorApp } from './app.js';
import { exampleSnapshot } from './fixtures.js';
import { present } from './presentation.js';
const args = process.argv.slice(2);
const modeArgument = args.find(value => value.startsWith('--mode='))?.slice(7);
if (modeArgument && !['interactive', 'static', 'pipe', 'accessible'].includes(modeArgument)) throw new Error('Use --mode=interactive|static|pipe|accessible');
// Presentation mode is an application choice. NO_COLOR only controls styling.
const mode = modeArgument ?? (!process.stdout.isTTY ? 'pipe' : process.env['CI'] ? 'static' : 'interactive');
const ctx = createNodeContext();
const selectedContext = { ...ctx, mode: mode === 'interactive' ? 'interactive' as const : mode === 'static' ? 'static' as const : mode === 'accessible' ? 'accessible' as const : 'pipe' as const };
if (mode !== 'interactive') {
  process.stdout.write(present(exampleSnapshot(), selectedContext, process.stdout.columns || 80) + '\n');
} else {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('Interactive mode requires a terminal; use --mode=static, pipe, or accessible');
  const shutdown = { subscribe: (stop: () => void): (() => void) => {
    process.on('SIGINT', stop); process.on('SIGTERM', stop);
    return () => { process.off('SIGINT', stop); process.off('SIGTERM', stop); };
  } };
  await run(createMonitorApp(selectedContext, shutdown), { ctx: selectedContext });
}
