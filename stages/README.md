# Build the monitor in five runnable stages

These are independent source snapshots, not switches on the finished application.
Each directory owns its model and presentation. Later stages add App and effects
modules. No stage imports `src/` or another stage. They share only the root pinned
dependency lock and installed toolchain. Install once with `npm ci`.

Use edition tag `book-v2`; the book records the immutable commit. `book-v1` remains
the original finished-application edition. Published Bijou stays pinned at 7.2.0.

## 01 — Facts before presentation

Run `npm run stage -- 01`; check with `npm run stage:check -- 01`.
You should see compile, test and publish queued at zero percent. Read `job.ts`,
`monitor.ts` and `presentation.ts`. The model validates identity and progress and
freezes its snapshots. There is no interaction or background work.

Completion: all three stable IDs appear, their states are queued, and invalid
progress or duplicate IDs are rejected. Add a job by constructing another valid
Job in a learning copy; its title must not substitute for its identity.

## 02 — The same facts in four forms

Read `npm run stage:diff -- 01 02`, then run stage 02 and its stage check.
New fixture data includes a failure with an explanation, a completed job and
forty-percent progress. `presentation.ts` supplies four formats. Interactive is a
content specimen at this stage; all four outputs print once and exit.

Completion: succeeded, failed, running, 40 and the failure explanation survive
every format. Pipe rows have exactly four tab-separated fields, including empty
error fields. Diagnose those facts before adding decoration.

## 03 — Input has an owner

Read `npm run stage:diff -- 02 03`. In a real terminal run stage 03, or use
`npm run stage -- 03 --mode=static` for its fixture snapshot. Run its stage check.
Up/Down selects. Enter marks a job running. C opens cancellation confirmation;
Enter confirms and Escape keeps it running. Q or Ctrl+C quits globally.
There are no timers, logs or failure filtering yet. Running remains running until
you cancel or quit. That is the complete declared behavior of this stage.

Completion: a dialog blocks movement, Escape leaves the running state intact,
and confirmation changes it to cancelled. At less than 80×24 cells the view
asks for a resize and Q remains available. Resize back to restore the task.

## 04 — Work and late results

Read `npm run stage:diff -- 03 04`, one file at a time: protocol, monitor,
effects, app and main, then presentation and fixtures. Run stage 04 and its check.
The simulated scheduler now emits progress and completion; the test job fails.
L loads logs, F filters failures, and run identities and view epochs reject stale
results. Cancellation and driver disposal have explicit owners.

Completion: old results cannot overwrite a restarted job or newly selected log
view; completion during confirmation remains successful; disposed work stops
emitting. Tests advance a deterministic scheduler. The simple view targets 80×32;
a smaller view asks for a resize rather than pretending the task fits.

## 05 — Constrained geometry

Read `npm run stage:diff -- 04 05`, run stage 05 and its checks, then resize to
24×8. Compact records, grapheme-aware wrapping, scrolling and selected-item
visibility replace the previous fixed viewport requirement. J/K scrolls.
`NO_COLOR=1` and `--locale=long` exercise monochrome and expanded-copy fixtures.

Completion: task state survives resize, selected work is reachable, errors remain
textual, and controlled Unicode fixtures fit their cell allocation. One-cell
checks establish bounds only. Practical usability at 24×8 still needs human
observation. This stage's eight application modules match `src/` byte for byte.

## Review a change without losing its boundary

The four `.patch` files under `diffs/` are actual unified diffs of adjacent source
modules. They include additions and deletions, not a prose approximation. They do
not include test and guide changes; inspect each stage's `test/` separately.
The largest step introduces asynchronous ownership across several small modules.
Read its files in the order above rather than treating a patch line count as a
substitute for understanding the new contract.

The original `checkpoint` commands remain useful inspections of the finished
application. They are distinct from these incremental source stages. Stage tests
run in ordinary `npm test` and CI. Broken exercises are kept separate; see the
[answer key](../answers/README.md) after attempting each failure.
