// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import type { Effect, MonitorEvent } from './protocol.js';
export interface SchedulePort { after(milliseconds: number, callback: () => void): () => void }
export class EffectDriver {
  private readonly work = new Map<string, () => void>();
  private cancelLogs: (() => void) | undefined;
  private disposed = false;
  public constructor(private readonly scheduler: SchedulePort) {}
  public execute(effect: Effect, emit: (event: MonitorEvent) => void): void {
    if (this.disposed) return;
    switch (effect.type) {
      case 'abort': this.work.get(effect.id)?.(); this.work.delete(effect.id); return;
      case 'abort-logs': this.cancelLogs?.(); this.cancelLogs = undefined; return;
      case 'load-logs': {
        this.cancelLogs?.();
        this.cancelLogs = this.scheduler.after(effect.id === 'compile' ? 300 : 100, () => {
          if (!this.disposed) emit({ type: 'logs-loaded', id: effect.id, epoch: effect.epoch, text: `Log snapshot for ${effect.id}\nNo external process was launched.\nFixture output: deterministic and inspectable.` });
        }); return;
      }
      case 'run': {
        this.work.get(effect.id)?.(); let cancelled = false; let pending: (() => void) | undefined;
        const step = (percent: number): void => {
          pending = this.scheduler.after(100, () => {
            if (cancelled || this.disposed) return;
            emit({ type: 'progress', id: effect.id, run: effect.run, percent });
            if (percent === 100) {
              this.work.delete(effect.id);
              emit(effect.id === 'test' ? { type: 'done', id: effect.id, run: effect.run, error: 'Fixture failure: assertion did not pass' } : { type: 'done', id: effect.id, run: effect.run });
            } else step(percent + 20);
          });
        };
        this.work.set(effect.id, () => { cancelled = true; pending?.(); }); step(20); return;
      }
    }
  }
  public dispose(): void {
    this.disposed = true; this.cancelLogs?.(); this.cancelLogs = undefined;
    for (const cancel of this.work.values()) cancel(); this.work.clear();
  }
}
