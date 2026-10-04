// attack.mjs — proposes a verdict for one standing conclusion. This is the
// adversarial pass: its only job is to try to kill the claim. It does NOT
// get the final say — evidence-verify.mjs checks every proposal before it
// counts toward anything.

export function attack(conclusion, evidenceDB) {
  const evidence = evidenceDB[conclusion.evidenceRef]

  if (!evidence || !evidence.checkable) {
    return { id: conclusion.id, proposedVerdict: 'STANDS', reasoning: 'No checkable evidence available to attack.' }
  }

  if (evidence.contradicts_claim === true) {
    return {
      id: conclusion.id,
      proposedVerdict: 'KILLED',
      reasoning: evidence.note || evidence.summary,
    }
  }

  if (evidence.contradicts_claim === false) {
    return {
      id: conclusion.id,
      proposedVerdict: 'STANDS',
      reasoning: 'Evidence checked, found no contradiction. The attack failed — that is a legitimate outcome, not a weak one.',
    }
  }

  // contradicts_claim === null: genuinely insufficient evidence either way.
  return {
    id: conclusion.id,
    proposedVerdict: 'WOUNDED',
    reasoning: evidence.note || 'Evidence is too thin to confirm or kill.',
  }
}
