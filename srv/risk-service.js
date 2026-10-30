import cds from '@sap/cds'

// Fixed outcomes for selected suppliers, so the demo story is repeatable
const DEMO_CASES = {
  17300001: { riskScore: 18 },
  17300002: { bankOwnerMismatch: true, riskScore: 82 },
  17300003: { sanctionsScore: 87, dissolvedYear: 2025 }
}

// Small deterministic hash (FNV-1a) so every supplier always gets the same answer
const hash = text => {
  let h = 0x811c9dc5
  for (const c of String(text)) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193) >>> 0
  return h
}

const rating = score => score < 35 ? 'Low' : score < 70 ? 'Medium' : 'High'

export default class RiskService extends cds.ApplicationService {
  init() {
    this.on('assess', req => {
      const { supplier, name = '', country, bankAccounts = [] } = req.data
      const h = hash(`${supplier}|${name}`)
      const demo = DEMO_CASES[supplier] ?? {}
      const results = []
      const add = (check, status, details) => results.push({ check, status, details })

      const dissolvedYear = demo.dissolvedYear ?? (h % 17 === 0 ? 2024 : null)
      const since = 1985 + (h % 35)
      add('Company registration', dissolvedYear ? 'Failed' : 'OK', dissolvedYear
        ? `Dissolved in ${dissolvedYear} (registered ${since}${country ? `, ${country}` : ''})`
        : `Registered and active since ${since}${country ? ` (${country})` : ''}`)

      const registeredName = h % 11 === 0 ? `${name} Holding` : name
      add('Registered name', registeredName === name ? 'OK' : 'Warning', registeredName === name
        ? 'Matches the name in SAP'
        : `Registered as "${registeredName}"`)

      const sanctionsScore = demo.sanctionsScore ?? (h % 23 === 0 ? 70 + (h % 25) : null)
      add('Sanctions screening', sanctionsScore ? 'Failed' : 'OK', sanctionsScore
        ? `Possible match on a sanctions list (score ${sanctionsScore}%), manual review required`
        : 'No match on sanctions lists')

      // Random scores stay Low/Medium; High risk only comes from the demo cases
      const riskScore = demo.riskScore ?? 5 + (h % 50)
      add('Credit risk', { Low: 'OK', Medium: 'Warning', High: 'Failed' }[rating(riskScore)],
        `Risk score ${riskScore}/100 (${rating(riskScore)})`)

      if (!bankAccounts.length) add('Bank account owner', 'Warning', 'No bank account to verify')
      for (const b of bankAccounts) {
        const id = b.iban || [b.bankNumber, b.account].filter(Boolean).join(' / ')
        const mismatch = demo.bankOwnerMismatch || hash(id) % 7 === 0
        add('Bank account owner', mismatch ? 'Failed' : 'OK', mismatch
          ? `${id}: account is registered to a different company`
          : `${id}: account owner verified`)
      }

      return {
        provider: 'Simulated Supplier Risk Service',
        simulated: true,
        checkedAt: new Date().toISOString(),
        registeredName,
        riskScore,
        riskRating: rating(riskScore),
        results
      }
    })

    return super.init()
  }
}
