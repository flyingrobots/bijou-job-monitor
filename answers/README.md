# Exercise answer key

Try each exercise before reading its answer. Run `npm run exercise -- NAME` in a
learning copy. A nonzero exit is the deliberate observable failure. Add `--repair`
to select the production path and see the same success criterion pass. The four
fixtures live in `exercises/run.ts`; the repaired behavior lives in `src/` and is
also present in the final progressive stage.

## Modal: selection moves behind confirmation

**Hint.** Inspect the selected ID before and after Down while confirmation is open.

**Diagnosis.** The faulty fixture creates a model with `confirming: false` before
applying movement. The painted dialog has lost its input boundary.

**Repair.** Preserve the confirming model and call its transition directly:
`dialog.update({ type: 'move', delta: 1 })`. The production model rejects movement,
filtering, starting and log navigation while the dialog owns those intentions.
The App translates Enter to confirm-cancel when appropriate.

**Why a plausible fix fails.** Painting the modal last changes pixels, not event
ownership. Blocking movement only in a widget also leaves other model callers
able to violate the same contract. Global quit remains an explicit exception.

**Success.** The selected ID is unchanged, Escape leaves the job running, and
confirmation requests cancellation only while the selected job is still running.
Run `npm run exercise -- modal --repair` and the model tests. A screenshot alone
cannot establish these observations.

## Stale: old logs replace current detail

**Hint.** Compare the result's job ID and epoch with the current selection and view.

**Diagnosis.** The faulty fixture assigns `late.text` directly into the current
model. It accepts detail from the previous selection without checking ownership.

**Repair.** Send the completion through `current.update(late)` and accept it only
when screen, selected ID and epoch still match. Requesting cancellation of the old
load is useful resource management; rejecting an old completion is correctness.

**Why a plausible fix fails.** A longer delay only makes the race less convenient
to reproduce. Cancellation can race an already queued result. Matching only the
job ID also fails when the same job is revisited under a newer view request.

**Success.** The old result leaves detail empty; a matching current result can fill
it; leaving logs prevents a completion from reopening the screen. Run the repaired
stale exercise and inspect the corresponding deterministic transition test.

## Color: failure disappears in monochrome

**Hint.** Strip ANSI sequences and ask which word still identifies failure.

**Diagnosis.** A red dot and a job name contain no textual failed state. A person
or consumer without that color has to guess the meaning.

**Repair.** Render the model's textual status and failure explanation. The repaired
fixture uses the production static formatter, then checks its stripped output for
`failed`. Optional color can reinforce that existing fact.

**Why a plausible fix fails.** Brighter red, another palette or a legend elsewhere
does not place the status in a copied row or machine stream. A passing `failed`
assertion is still a narrow observation; check the error explanation and every
promised mode as well.

**Success.** Failure remains understandable with styling removed, and TSV retains
its status and error fields. Run the repaired color exercise and mode tests.

## Timer: work emits after its owner closes

**Hint.** Identify who owns the schedule and where that owner is disposed.

**Diagnosis.** The faulty branch advances a callback without disposing its driver.
Its producer can still emit a progress event after the owning session is closed.

**Repair.** Call `driver.dispose()` before advancing the deterministic schedule.
The driver cancels pending work and suppresses emissions after disposal. App quit
and the host finalization connect application shutdown to that lifecycle.

**Why a plausible fix fails.** Hiding a pane or discarding an event in the view can
leave its producer running. A global job may intentionally survive closing its
log pane, so blindly cancelling all work on every screen change is also wrong.
The driver belongs to the application session; log requests have a narrower owner.

**Success.** Advancing the schedule after disposal emits no new events. Cancellation,
stale-result rejection and disposal require separate observations. The repaired
timer fixture checks emissions; a PTY check separately examines terminal cleanup.

## Verify that a repair preserves a nearby promise

After the repaired fixtures pass, run `npm run verify`. For the cancellation-race
maintenance exercise, keep the test where completion occurs during confirmation:
confirming afterwards must close the dialog without overwriting success or emitting
an abort. This prevents a repair from changing Escape or cancellation semantics.
