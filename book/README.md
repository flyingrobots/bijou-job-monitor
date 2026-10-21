# The Bijou Book

[Read the teaching book](bijou-book.pdf). Its fourteen chapters form five Parts,
including seven workshops that build and test the application in this repository.
The component atlas, renderer gallery, glossary, topic finder, exercise answers
and unfamiliar-reader protocol follow the main text.

## Source and application editions

This directory is the canonical home for the teaching book. Modular LaTeX lives
in `teaching/`, `workshops/`, `reference/` and `appendices/`; required TikZ diagrams,
rendered artwork, fonts and licenses are included. A sibling Bijou checkout is
not required to compile the PDF.

The application taught by this edition remains pinned to `book-v2`, commit
`1c5c47ce0eeeb7342fb7e95e6424a2256c1288a1`, using published Bijou 7.2.0.
That immutable tag predates the book's relocation. Clone the current repository
to obtain both the book and app; check out `book-v2` to reproduce the recorded
application evidence exactly. No new application release is implied by this move.

The [Design Archive](https://github.com/flyingrobots/bijou/blob/main/docs/book/bijou-archive.pdf)
and [frozen complete edition](https://github.com/flyingrobots/bijou/blob/main/docs/book/bijou-designs.pdf)
remain in Bijou. Their 426 historical records and exact-source corpus are not
copied into this teaching repository. The complete edition retains its own
historical teaching snapshot; future teaching edits belong here.

`migration-manifest.json` records the original Bijou commit and each imported
file's SHA-256. `publication.json` records the relocated PDF and build evidence.
Capture and font manifests preserve the original artwork provenance; they are
historical capture records, not instructions to regenerate assets from this app.

## Build the PDF

Install LuaLaTeX with the packages named in `preamble.tex` and DejaVu Sans for
symbol fallback. From this directory:

```sh
make build
# After reviewing the build, replace the checked-in PDF:
make pdf
```

All intermediate output defaults to `/tmp/bijou-job-monitor-book`; override
`OUTPUT` when needed. Three passes resolve contents and cross-references.
On a shared workstation use its resource reservations and bounded runner.
The existing publication worker is `bijou-design-book-worker`; keep build
outputs outside images and stop the worker after validation.

## Licenses and evidence

Copyright © 2026 James Ross. Book prose, diagrams and illustrations are CC BY 4.0,
except material separately identified. See [COPYING.md](COPYING.md) and the
copyright page. Code examples are Apache-2.0, with the full license in the book
appendix and `licenses/Apache-2.0.txt`; preserve applicable notices in
`companion-snippets/`. Font licenses accompany the fonts.

The existing application evidence is 44 tests, hosted CI and six recorded local
PTY cases. The human walkthrough is prepared and has not been conducted.
Report book and application errata in this repository's issue tracker.
