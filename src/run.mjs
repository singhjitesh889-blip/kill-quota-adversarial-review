#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { attack } from './attack.mjs'
import { verify } from './evidence-verify.mjs'

const MIN_KILL_QUOTA = 2 // KILLED + WOUNDED combined, per run

const conclusions = JSON.parse(readFileSync(new URL('../data/standing-conclusions.json', import.meta.url), 'utf-8'))
const evidenceDB = JSON.parse(readFileSync(new URL('../data/evidence.json', import.meta.url), 'utf-8'))

console.log(`Attacking ${conclusions.length} standing conclusions. Quota: at least ${MIN_KILL_QUOTA} real KILLED/WOUNDED verdicts.\n`)

const results = conclusions.map(c => {
  const proposed = attack(c, evidenceDB)
  const final = verify(proposed, evidenceDB, c)
  return { ...c, ...final }
})

for (const r of results) {
  const icon = r.verdict === 'KILLED' ? '✗ KILLED' : r.verdict === 'WOUNDED' ? '⚑ WOUNDED' : '✓ STANDS'
  console.log(`${r.id}: ${icon}`)
  console.log(`  claim: ${r.claim}`)
  if (r.downgraded) {
    console.log(`  [evidence-verify rejected the proposed ${r.proposedVerdict}]: ${r.downgradeReason}`)
  } else {
    console.log(`  reasoning: ${r.reasoning}`)
  }
  console.log()
}

const killedOrWounded = results.filter(r => r.verdict === 'KILLED' || r.verdict === 'WOUNDED').length
const killed = results.filter(r => r.verdict === 'KILLED').length
const wounded = results.filter(r => r.verdict === 'WOUNDED').length
const stands = results.filter(r => r.verdict === 'STANDS').length

console.log(`--- ${killed} killed, ${wounded} wounded, ${stands} stands ---`)

if (killedOrWounded < MIN_KILL_QUOTA) {
  console.log(`\n✗ QUOTA NOT MET (${killedOrWounded} < ${MIN_KILL_QUOTA}). This run does not ship.`)
  console.log(`  The fix is not to fabricate a kill — it's to attack harder or pull more evidence.`)
  process.exit(1)
} else {
  console.log(`\n✓ QUOTA MET (${killedOrWounded} >= ${MIN_KILL_QUOTA}). Run is valid.`)
}
