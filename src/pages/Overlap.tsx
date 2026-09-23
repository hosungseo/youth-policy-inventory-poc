import { useMemo, useState } from 'react'
import type { Dataset } from '../data'
import { ageText, fmt } from '../data'
import { Chip, Section } from '../components'

const SIDO_ORDER = ['중앙', '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '전남광주', '경북', '경남', '제주']

export default function Overlap({ data }: { data: Dataset }) {
  const { summary, gov24Only } = data
  const clusters = summary.clusters
  const types = Object.keys(clusters).sort((a, b) => sum(clusters[b]) - sum(clusters[a]))
  const cols = SIDO_ORDER.filter((s) => types.some((t) => clusters[t][s]))
  const max = Math.max(...types.flatMap((t) => Object.values(clusters[t])))

  const [q, setQ] = useState('')
  const [instType, setInstType] = useState('all')
  const instTypes = useMemo(() => [...new Set(gov24Only.map((g) => g.instType))], [gov24Only])
  const rows = useMemo(
    () =>
      gov24Only.filter(
        (g) => (instType === 'all' || g.instType === instType) && (!q.trim() || `${g.nm} ${g.inst}`.includes(q.trim())),
      ),
    [gov24Only, q, instType],
  )

  return (
    <>
      <div className="page-head">
        <h1>중복·사각지대</h1>
        <p className="lead">
          인벤토리가 있으면 “비슷한 사업이 어디에 몇 개 있는가”와 “청년 대상인데 청년 창구에 없는 서비스는 무엇인가”를 바로 셀 수 있습니다.
        </p>
      </div>

      <Section title="유사 사업 분포" lead="정책명에 같은 유형어가 들어간 온통청년 등록 정책 수 (시도 × 유형). 같은 지역 안에서도 광역·기초가 따로 운영하는 경우가 많습니다.">
        <div className="table-scroll">
          <table className="heat">
            <thead>
              <tr>
                <th>유형</th>
                {cols.map((s) => <th key={s}>{s}</th>)}
                <th>합계</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t}>
                  <th>{t}</th>
                  {cols.map((s) => {
                    const v = clusters[t][s] ?? 0
                    return (
                      <td key={s} style={{ ['--h' as string]: v ? 0.12 + (v / max) * 0.88 : 0 }} className={v ? 'hot' : ''}>
                        {v || ''}
                      </td>
                    )
                  })}
                  <td className="num strong">{sum(clusters[t])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="footnote">
          수치는 정책명 키워드 기준의 단순 집계로, 대상·금액이 다른 사업이 함께 묶일 수 있습니다. 인벤토리에서는 표준 사업유형 코드로 대체합니다.
        </p>
      </Section>

      <Section
        title={`온통청년과 연결되지 않은 보조금24 청년 서비스 ${fmt(gov24Only.length)}건`}
        lead={`보조금24 전체 ${fmt(summary.gov24Total)}건 중 청년 관련 ${fmt(summary.gov24Youth)}건(명칭·대상 문구·연령조건 기준)을 골라, 자동 매칭으로 온통청년 정책과 연결되지 않은 서비스만 모았습니다. 이름이 크게 다른 사업은 실제로는 등록돼 있을 수 있어, 인벤토리 정비 시 등록기관 확인 목록으로 씁니다.`}
      >
        <div className="filters card slim">
          <input className="search" type="search" placeholder="서비스명·기관 검색" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={instType} onChange={(e) => setInstType(e.target.value)} aria-label="기관 유형">
            <option value="all">기관 유형 전체</option>
            {instTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <span className="result-count">{fmt(rows.length)}건</span>
        </div>
        <div className="table-scroll">
          <table className="list-table">
            <thead>
              <tr><th>서비스명</th><th>소관기관</th><th>분야</th><th>연령</th><th>근거</th></tr>
            </thead>
            <tbody>
              {rows.slice(0, 200).map((g) => (
                <tr key={g.id}>
                  <td><a href={g.url} target="_blank" rel="noreferrer">{g.nm}</a></td>
                  <td>{g.inst}<br /><small className="muted">{g.instType}</small></td>
                  <td>{g.field}</td>
                  <td className="nowrap">{ageText(g.ageMin, g.ageMax)}</td>
                  <td><Chip tone={g.tier === '명칭' ? 'info' : 'muted'}>{g.tier}</Chip></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > 200 && <p className="footnote">상위 200건만 표시합니다. 검색으로 좁혀 보세요.</p>}
      </Section>
    </>
  )
}

function sum(o: Record<string, number>) {
  return Object.values(o).reduce((a, b) => a + b, 0)
}
