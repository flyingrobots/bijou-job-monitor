# Bijou Job Monitor

A small, runnable companion to the Bijou Book. Build one job monitor across interactive, static/CI, pipe and accessible presentations, then introduce cancellation, late results, constrained geometry and reproducible checks.

[Read the Bijou Book](book/bijou-book.pdf) · [Book sources and build instructions](book/README.md)

The example simulates jobs with scheduled events. It does not launch build tools, contact a service, publish packages, or cancel operating-system processes. The `test` job deliberately fails so failure stays visible in every presentation.

## Reproduce this edition

Published dependencies are pinned to **Bijou 7.2.0** in `package.json` and `package-lock.json`. The book’s archived design records and its 8.0.0-rc.1 component artwork are separate evidence. Tested locally with Node **26.10.0**, npm **11.19.1**, on macOS arm64. See [VERIFICATION.json](VERIFICATION.json) for the measured boundary.

```sh
npm ci
npm run verify
npm start
npm start -- --mode=static
npm start -- --mode=pipe > jobs.tsv
npm start -- --mode=accessible
NO_COLOR=1 npm start -- --mode=static --locale=long
```

`npm start` prints npm’s script banner in some configurations: use `npm run --silent start -- --mode=pipe > jobs.tsv` or `node --import tsx src/main.ts --mode=pipe > jobs.tsv` for a machine-readable stream. Without a TTY, the application chooses pipe mode. A CI environment with a TTY chooses static mode. `NO_COLOR` removes styling; explicit presentation selection remains an application choice.

Keyboard: Up/Down select a job; Enter starts it; `c` opens confirmation; Enter confirms and Escape keeps it running; `l` opens logs; `f` filters failed jobs; `j`/`k` scroll; `q` or Ctrl+C quits. A dialog owns selection and action keys; quitting is an explicit global command. At least 24×8 cells is the practical small-viewport target. The 1-cell geometry tests establish bounds only.

## Progressive build stages

Edition `book-v2` adds five independent source snapshots. Each stage owns its
modules and imports neither the finished application nor another stage. Install
once from the pinned root lock, then build along using the actual source diffs:

```sh
npm run stage -- 01
npm run stage:check -- 01
npm run stage:diff -- 01 02
npm run stage -- 02
npm run stage -- 03
npm run stage -- 04
npm run stage -- 05
```

[The stage guide](stages/README.md) states each addition, deliberate limitation
and observable completion criterion. Stages 03 and 04 use real keyboard input
when run in a terminal; stages 01 and 02 print and exit. All stage checks run in
ordinary tests and CI. Stage 05 matches the finished application modules exactly.

Attempt the broken exercises before opening the [answer key](answers/README.md).
The [walkthrough protocol](walkthrough/README.md) and blank recording form are
prepared for an actual unfamiliar reader and assistive-tool session. No human
results are claimed. The accessible CLI remains a static snapshot.

## Finished-application inspections

These original `checkpoint` commands inspect the finished application. They are retained at `book-v2` and the original `book-v1`; use the separate `stage` commands above for incremental source implementations.

| Book workshop | Command | Working state |
| --- | --- | --- |
| W1: domain and snapshot | `npm run checkpoint -- 01` | Three queued jobs, stable identities, textual state |
| W2: four presentations | `npm run checkpoint -- 02` | Same fixture through all four Bijou modes |
| W3: input and cancellation | `npm run checkpoint -- 03` | Interactive application with explicit input ownership |
| W4: asynchronous identity | `npm run checkpoint -- 04` | A late log completion is rejected after selection changes |
| W5: constrained terminals | `npm run checkpoint -- 05` | Narrow layout and long-copy fixture |
| W6: tests and repairs | `npm run verify` | Model, effects, output, geometry and application-routing checks |
| W7: package and reproduce | `npm pack --dry-run` | Inspect the source package and its full Apache license |

The progressively introduced modules are `job.ts`, `monitor.ts`, `presentation.ts`, `app.ts`, and `effects.ts`. `capture.ts` writes the four actual fixture outputs and cell projections for the printed book. It does not claim an emulator screenshot or a screen-reader session.

## Break it on purpose

These fixtures are intentionally faulty and exit nonzero until repaired. Default `npm test` does not include them.

```sh
npm run exercise -- modal
npm run exercise -- stale
npm run exercise -- color
npm run exercise -- timer
npm run exercise -- stale --repair
```

The observable success criteria are: a dialog does not move the job behind it; a stale response does not replace the selected job’s logs; failure remains understandable with color removed; closing work stops later progress emissions. Compare the failing branch in `exercises/run.ts` with the production path selected by `--repair`. Do not distribute these faulty snippets as production examples without their warning.

## What the evidence means

The deterministic scheduler verifies completion, failure, cancellation and disposal without sleeps. Model checks verify selection, run identities, view epochs and transitions. Presentation checks verify TSV, text labels, dimensions and Unicode cell bounds. App checks exercise framework messages and rendered cells. A separate pseudo-terminal check covers keyboard quit, resize, SIGTERM and terminal flag restoration on the recorded host. These checks do not establish usability with a particular screen reader, every terminal emulator or every Unicode font. Those require human sessions and additional environment evidence.

The app has no localization catalog yet: `--locale=long` is a deliberate text-expansion fixture, not a translated product. It has no real process runner or persistence. Those are explicit extension exercises, not hidden promises.

## License, book and errata

Copyright © 2026 James Ross. Example code is Apache-2.0; see the complete [LICENSE](LICENSE) and [NOTICE](NOTICE). Preserve these files, source-file copyright notices and any applicable dependency notices when redistributing code. Book prose and illustrations carry their own CC BY 4.0 notice.

The teaching book and its modular LaTeX sources live in [book/](book/README.md), beside the application. The historical Design Archive and frozen complete edition remain in [flyingrobots/bijou](https://github.com/flyingrobots/bijou). The distributed book records its exact companion commit. Report errata in [this repository’s issue tracker](https://github.com/flyingrobots/bijou-job-monitor/issues).
