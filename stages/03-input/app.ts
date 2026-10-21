// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import type { BijouContext } from '@flyingrobots/bijou';
import { isKeyMsg, quit, type App } from '@flyingrobots/bijou-tui';
import { Monitor } from './monitor.js';
import type { MonitorEvent } from './protocol.js';
import { view } from './presentation.js';
export interface AppModel { readonly monitor: Monitor; readonly width: number; readonly height: number }
export interface ShutdownPort { subscribe(stop: () => void): () => void }
export function createMonitorApp(ctx: BijouContext, shutdown?: ShutdownPort): App<AppModel, { readonly type: 'shutdown' }> {
  return {
    init: () => [{ monitor: Monitor.initial(), width: ctx.runtime.columns, height: ctx.runtime.rows }, shutdown ? [emit => shutdown.subscribe(() => emit({ type: 'shutdown' }))] : []],
    update: (message, model) => {
      if (message.type === 'shutdown') return [model, [quit()]];
      if (message.type === 'resize') return [{ ...model, width: Math.max(1, message.columns), height: Math.max(1, message.rows) }, []];
      if (!isKeyMsg(message)) return [model, []];
      if (message.key === 'q' || (message.ctrl && message.key === 'c')) return [model, [quit()]];
      let intent: MonitorEvent | undefined;
      if (message.key === 'up') intent = { type: 'move', delta: -1 };
      if (message.key === 'down') intent = { type: 'move', delta: 1 };
      if (message.key === 'enter' || message.key === 'return') intent = { type: model.monitor.confirming ? 'confirm-cancel' : 'start' };
      if (message.key === 'c') intent = { type: 'ask-cancel' };
      if (message.key === 'escape') intent = { type: 'dismiss' };
      return intent ? [{ ...model, monitor: model.monitor.update(intent) }, []] : [model, []];
    },
    view: model => view(model.monitor, ctx, model.width, model.height),
  };
}
