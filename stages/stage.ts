// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
const directories = ['01-model', '02-modes', '03-input', '04-async', '05-constraints'] as const;
export function stageDirectory(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Choose stage 01, 02, 03, 04, or 05');
  const directory = directories.find(item => item.startsWith(value + '-'));
  if (!directory) throw new Error('Choose stage 01, 02, 03, 04, or 05');
  return directory;
}
