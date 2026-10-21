// Copyright 2026 James Ross. SPDX-License-Identifier: Apache-2.0
import { Job } from './job.js';
import { Monitor } from './monitor.js';
export function exampleSnapshot(): Monitor {
  return new Monitor({ jobs: [new Job('compile', 'Compile the application', 'succeeded', 100, 1), new Job('test', 'Run the tests', 'failed', 60, 1, 'Fixture failure: assertion did not pass'), new Job('publish', 'Publish the package', 'running', 40, 1)], selected: 'publish', failuresOnly: false, confirming: false, screen: 'jobs', epoch: 0, detail: '' });
}
