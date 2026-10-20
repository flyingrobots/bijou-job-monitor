// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createNodeContext } from '@flyingrobots/bijou-node';
import { stringToSurface, stripAnsi, wrapToWidth, colorHex, type Surface } from '@flyingrobots/bijou';
import { exampleSnapshot } from './fixtures.js';
import { present } from './presentation.js';
const output = resolve(process.argv.find(arg => arg.startsWith('--out='))?.slice(6) ?? 'captures');
mkdirSync(output, { recursive: true });
const base = createNodeContext(); const frames = [];
function cells(frame: Surface): object[] {
  const result = [];
  for (let y = 0; y < frame.height; y++) for (let x = 0; x < frame.width; x++) {
    const cell = frame.get(x, y);
    result.push({ x, y, char: cell.char ?? ' ', fg: colorHex(cell.fg), bg: colorHex(cell.bg), modifiers: cell.modifiers, empty: cell.empty });
  }
  return result;
}
for (const mode of ['interactive', 'static', 'pipe', 'accessible'] as const) {
  const text = present(exampleSnapshot(), { ...base, mode }, 40);
  writeFileSync(resolve(output, mode + '.txt'), text + '\n');
  const display = stripAnsi(text).replace(/\t/gu, ' ⇥ ');
  const lines = wrapToWidth(display, 40); const frame = stringToSurface(lines.join('\n'), 40, lines.length);
  frames.push({ id: 'monitor-' + mode, title: 'Job monitor / ' + mode, mode, width: frame.width, height: frame.height, cells: cells(frame), presentation: mode === 'pipe' ? 'Tabs shown as ⇥ for print; raw output is preserved separately.' : 'Complete deterministic fixture output, wrapped at 40 cells for print.' });
}
writeFileSync(resolve(output, 'frames.json'), JSON.stringify(frames));
console.log(JSON.stringify({ output, frames: frames.map(frame => [frame.mode, frame.width, frame.height]) }));
