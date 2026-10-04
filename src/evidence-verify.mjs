// evidence-verify.mjs — the gate that stops the kill quota from being
// gamed. A KILLED or WOUNDED verdict only survives if it cites real,
// checkable evidence that actually supports that verdict. A proposed kill
// with no real evidence behind it gets downgraded back to STANDS, no
// matter how badly the run needs another kill to hit quota.

export function verify(proposed, evidenceDB, conclusion) {
  const evidence = evidenceDB[conclusion.evidenceRef]

  if (proposed.proposedVerdict === 'KILLED') {
    const hasRealEvidence = evidence && evidence.checkable && evidence.contradicts_claim === true
    if (!hasRealEvidence) {
      return { ...proposed, verdict: 'STANDS', downgraded: true, downgradeReason: 'Proposed KILLED but no checkable contradicting evidence exists — rejected, not counted.' }
    }
    return { ...proposed, verdict: 'KILLED', downgraded: false }
  }

  if (proposed.proposedVerdict === 'WOUNDED') {
    if (!evidence || !evidence.checkable) {
      return { ...proposed, verdict: 'STANDS', downgraded: true, downgradeReason: 'Proposed WOUNDED but no checkable evidence exists at all — rejected, not counted.' }
    }
    return { ...proposed, verdict: 'WOUNDED', downgraded: false }
  }

  return { ...proposed, verdict: 'STANDS', downgraded: false }
}
