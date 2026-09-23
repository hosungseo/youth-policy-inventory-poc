export type Gov24Link = {
  id: string
  nm: string
  inst: string
  url: string
  conf: '높음' | '중간'
  type: string
  apply: string
  recv: string
  ageMin: number | null
  ageMax: number | null
  views: number
}

export type Policy = {
  id: string
  nm: string
  inst: string
  grp: '중앙' | '지자체' | '기타'
  sido: string
  region: string
  cat: string
  catRaw: string
  oldCat: boolean
  status: '상시' | '진행중' | '마감'
  aplyEnd: string | null
  ageMin: number | null
  ageMax: number | null
  earn: string
  earnTxt: string
  url: string | null
  scale: number | null
  plan: { cycle: number | null; asmt: string; way: string }
  reg: string
  mod: string
  expl: string
  sprt: string
  views: number | null
  types: string[]
  g24?: Gov24Link
  fiscal?: { bdg: number; ep: number; n: number; items: { side: '지방' | '중앙'; nm: string; org: string; bdg: number; ep: number; asof: string }[] }
  diff?: { age: boolean; inc: boolean; ageKind: string | null; incKind: string | null; incOn: number | null; incG24: number | null }
}

export type Gov24Only = {
  id: string
  nm: string
  inst: string
  instType: string
  field: string
  tier: string
  ageMin: number | null
  ageMax: number | null
  url: string
}

type Rate = { n: number; matched: number; high: number }

export type Summary = {
  stamp: string
  profile: Record<string, unknown>
  total: number
  gov24Total: number
  gov24Youth: number
  gov24YouthUnmatched: number
  gov24Absence?: { population: number; sample: number; notYouth: number; youthTargetedShare: number; absentAmongYouth: number; absentYouthN: number; absentYouthNCi: [number, number] }
  match: { all: Rate; 중앙: Rate; 지자체: Rate }
  matchByCat: Record<string, Rate>
  matchBySido: Record<string, Rate>
  conditions: { pairs: number; anyDiff: number; ageDiff: number; incDiff: number; kinds: Record<string, number>; substantive: number }
  reviewCandidates?: number
  oldCat: number
  clusters: Record<string, Record<string, number>>
  precision?: { high: number; mid: number; sample: number }
}

export type FiscalAgg = { n: number; linked: number; bdg: number; bdgLinked: number; ep: number }

export type Fiscal = {
  asofLocal: string
  asofCentral: string
  local: FiscalAgg
  localSupport: FiscalAgg
  central: FiscalAgg
  centralInclusive: FiscalAgg
  bySido: Record<string, FiscalAgg & { support: FiscalAgg }>
  byKind: Record<string, FiscalAgg>
  central_rows: { nm: string; unit: string | null; org: string; tier: number; bdg: number; ep: number; link: string | null; linkType: string | null; linkNm: string | null; note: string }[]
  local_unlinked: { nm: string; org: string; sido: string; field: string; kind: string; bdg: number; ep: number; gukbi: boolean; cand: string | null }[]
  onthongWithBudget: number
  estimate: { absentShare: number; ci: number[]; absentBudgetShare: number; ciBudget: number[]; sample: number; population: number }
  accuracy: { presence: number; absence: number; strict: number; sample: number }
}
