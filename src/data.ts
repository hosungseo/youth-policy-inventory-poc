declare const __BUILD_ID__: string
import { useEffect, useState } from 'react'
import type { Fiscal, Gov24Only, Policy, Summary } from './types'

export type Dataset = { policies: Policy[]; gov24Only: Gov24Only[]; summary: Summary; fiscal: Fiscal }

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/${path}?v=${__BUILD_ID__}`)
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
  return (await res.json()) as T
}

export function useDataset() {
  const [data, setData] = useState<Dataset | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [policies, gov24Only, summary, fiscal] = await Promise.all([
          getJson<Policy[]>('policies.json'),
          getJson<Gov24Only[]>('gov24_only.json'),
          getJson<Summary>('summary.json'),
          getJson<Fiscal>('fiscal.json'),
        ])
        setData({ policies, gov24Only, summary, fiscal })
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    }
    void load()
  }, [])

  return { data, error }
}

export const fmt = (n: number) => n.toLocaleString('ko-KR')
export const pct = (k: number, n: number) => (n ? `${((k / n) * 100).toFixed(1)}%` : '–')

export const ageText = (min: number | null, max: number | null) => {
  if (!min && max == null) return '제한 없음'
  if (!min) return `~${max}세`
  if (max == null) return `${min}세~`
  return `${min ?? ''}~${max ?? ''}세`
}

/** Required inventory fields and whether this policy fills them today. */
export function completeness(p: Policy) {
  return [
    { key: '정책 ID', ok: true },
    { key: '보조금24 서비스ID', ok: !!p.g24 },
    { key: '기본계획 과제번호', ok: !!p.plan.asmt && p.plan.cycle === 2 },
    { key: '자격조건(표준코드)', ok: !!p.g24 },
    { key: '신청 경로', ok: !!p.url || !!p.g24 },
    { key: '지원규모', ok: p.scale != null },
    { key: '예산', ok: !!p.fiscal },
    { key: '수혜실적', ok: false },
    { key: '성과지표', ok: false },
  ]
}
