# kill-quota-adversarial-review

A review with no quota tends to rubber-stamp: if nothing is obviously broken,
"looks fine" is the easiest thing to write. This repo is a minimal, runnable
demonstration of the fix — **a forced minimum disagreement rate against your
own standing beliefs**, with a gate that stops the quota from being met by
fabricating a kill.

## The mechanism

This is a different question from the other patterns here. `verifier-gate-pattern`
asks *"is this output correct?"* `shadow-mode-verdict-gate` asks *"has this new
logic earned trust yet?"* This asks something else: **"we hold N beliefs we
currently think are settled — find at least 2 that are wrong, every cycle, on
purpose."** A belief nobody tried to kill isn't a confirmed belief. It's a
guess with confidence.

Two gates, not one:
1. **The quota itself** — attack every standing conclusion, and the run isn't
   valid unless at least `MIN_KILL_QUOTA` of them come back KILLED or WOUNDED.
2. **Evidence-verify** — a KILLED or WOUNDED verdict only survives if it cites
   real, checkable evidence that actually contradicts the claim. This is what
   stops the quota from being gamed: a weak or fabricated kill gets downgraded
   back to STANDS before it's counted, no matter how badly the run needs
   another one.

And an honest escape valve: if the evidence is genuinely too thin to prove or
disprove something, the verdict caps at WOUNDED. It is never forced to
KILLED just to hit the number.

## Run it (under a minute, zero external dependencies)

```bash
npm start
```

Actual output from this repo's own code:

```
Attacking 4 standing conclusions. Quota: at least 2 real KILLED/WOUNDED verdicts.

C1: ✗ KILLED
  claim: Weak onboarding caused the signup drop in March.
  reasoning: A constant can't explain a change. Separately, traffic-source mix shifted toward a lower-intent channel in the same window -- that's the thing that actually moved, and it's worse than the original claim implied.

C2: ✗ KILLED
  claim: We have best-in-class retention compared to the Q1 benchmark report.
  reasoning: The internal number isn't being disputed -- the benchmark's categories don't match it, so the comparison itself is invalid.

C3: ✓ STANDS
  claim: Price sensitivity is highest in the lowest-income segment.
  reasoning: Evidence checked, found no contradiction. The attack failed — that is a legitimate outcome, not a weak one.

C4: ⚑ WOUNDED
  claim: Users churn because support response time is too slow.
  reasoning: Not enough evidence to kill OR confirm. The claim might be true -- there's just nothing here that proves or disproves it at scale.

--- 2 killed, 1 wounded, 1 stands ---

✓ QUOTA MET (3 >= 2). Run is valid.
```

Two genuinely different kill mechanisms, worth noticing: C1 is killed by showing
the supposed cause was *constant* while the effect changed — a constant can't
explain a change. C2 is killed without disputing the internal number at all —
by showing the thing it's being *compared against* uses incompatible
categories, which invalidates the comparison itself, not the number.

Try editing `data/evidence.json` to make `C1`'s evidence `"checkable": false`
and re-run — watch `evidence-verify` reject the kill and fall back to STANDS,
dropping the run below quota. That rejection path is the point: the quota
can't be satisfied by removing the evidence requirement.

## Why this matters

In the system this pattern is drawn from, this runs monthly against the
system's own standing strategic conclusions, with a real minimum kill quota
of 2. A recent real run: 4 conclusions attacked, 2 killed, 2 wounded, 0
rubber-stamped. Both real kills matched the two mechanisms above —
contradiction-by-constant and contradiction-by-invalid-comparison — which is
exactly the kind of evidence a review process with no quota rarely bothers
to go looking for, because nothing was obviously broken before it looked.
