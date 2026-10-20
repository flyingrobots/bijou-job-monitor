// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
export type MonitorEvent =
  | { readonly type: 'move'; readonly delta: number }
  | { readonly type: 'start' }
  | { readonly type: 'ask-cancel' }
  | { readonly type: 'confirm-cancel' }
  | { readonly type: 'dismiss' };
