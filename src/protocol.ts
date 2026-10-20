// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
export type MonitorEvent =
  | { readonly type: 'move'; readonly delta: number }
  | { readonly type: 'filter' }
  | { readonly type: 'start' }
  | { readonly type: 'ask-cancel' }
  | { readonly type: 'confirm-cancel' }
  | { readonly type: 'dismiss' }
  | { readonly type: 'logs' }
  | { readonly type: 'progress'; readonly id: string; readonly run: number; readonly percent: number }
  | { readonly type: 'done'; readonly id: string; readonly run: number; readonly error?: string }
  | { readonly type: 'logs-loaded'; readonly id: string; readonly epoch: number; readonly text: string };
export type Effect =
  | { readonly type: 'run'; readonly id: string; readonly run: number }
  | { readonly type: 'abort'; readonly id: string }
  | { readonly type: 'load-logs'; readonly id: string; readonly epoch: number }
  | { readonly type: 'abort-logs' };
