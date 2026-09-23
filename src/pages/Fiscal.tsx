import { useMemo, useState } from 'react'
import type { Dataset } from '../data'
import { fmt, pct } from '../data'
import type { FiscalAgg } from '../types'
import { Bar, Chip, Section, Stat } from '../components'

const eok = (won: number) => `${fmt(Math.round(won / 1e8))}억 원`
const jo = (won: number) => (won >= 1e12 ? `${(won / 1e12).toFixed(1)}조 원` : eok(won))
const ymd = (s: string) => `${s.slice(0, 4)}.${s.slice(4, 6)}.${s.slice(6, 8)}`

export default function Fiscal({ data }: { data: Dataset }) {
  const { fiscal, summary } = data
  const f = fiscal
  const [sido, setSido] = useState('all')
  const [kindFilter, setKindFilter] = useState('대상자 지원')
  const [q, setQ] = useState('')
  const sidos = Object.keys(f.bySido)
  const rows = useMemo(
    () =>
      f.local_unlinked.filter(
        (r) => (sido === 'all' || r.sido === sido) && (kindFilter === 'all' || r.kind === kindFilter) && (!q.trim() || `${r.nm} ${r.org}`.includes(q.trim())),
      ),
    [f.local_unlinked, sido, kindFilter, q],
  )
  const centralMissing = f.central_rows.filter((r) => r.tier !== 3 && !r.link)
  const centralMissingBdg = centralMissing.reduce((a, r) => a + r.bdg, 0)
  const localMissing = f.local.n - f.local.linked
  const localMissingBdg = f.local.bdg - f.local.bdgLinked

  return (
    <>
      <div className="page-head">
        <h1>재정 연계</h1>
        <p className="lead">
          온통청년을 가운데 두고 <strong>보조금24</strong>(자격·신청), <strong>지방재정365</strong>(지자체 세부사업 예산·집행), <strong>열린재정</strong>(중앙 세부사업 예산·집행)을
          이었습니다. 예산이 잡힌 청년사업 중 온통청년에 없는 것, 반대로 온통청년 정책에 붙일 수 있는 예산을 한 번에 봅니다.
        </p>
      </div>

      <div className="hub">
        <div className="hub-node center">
          <em>온통청년</em>
          <b>{fmt(summary.total)}건</b>
          <span>정책 인벤토리의 기준 목록</span>
        </div>
        <div className="hub-spokes">
          <div className="hub-node">
            <em>보조금24</em>
            <b>{fmt(summary.match.all.matched)}건 연결</b>
            <span>서비스ID · 자격조건 표준코드</span>
          </div>
          <div className="hub-node">
            <em>지방재정365</em>
            <b>{fmt(f.local.linked)} / {fmt(f.local.n)}개</b>
            <span>청년 세부사업 · {ymd(f.asofLocal)} 기준</span>
          </div>
          <div className="hub-node">
            <em>열린재정</em>
            <b>{fmt(f.central.linked)} / {fmt(f.central.n)}개</b>
            <span>중앙 청년 세부사업 · {ymd(f.asofCentral)} 기준</span>
          </div>
        </div>
      </div>

      <Section title="예산은 있는데 온통청년에는 없는 청년사업">
        <div className="stat-grid three">
          <Stat
            tone="warn"
            value={jo(centralMissingBdg)}
            label={`중앙 청년 세부사업 ${fmt(centralMissing.length)}개`}
            note={`맞춤형 국가장학금(${jo(f.central_rows.find((r) => r.nm.includes('맞춤형 국가장학금'))?.bdg ?? 0)})이 대부분`}
          />
          <Stat
            tone="warn"
            value={`약 ${f.estimate.absentShare}%`}
            label={`지방 청년 세부사업 ${fmt(f.local.n)}개 중 온통청년에 없는 비율`}
            note={`표본 ${f.estimate.sample}건 검토 추정(95% 구간 ${f.estimate.ci[0]}~${f.estimate.ci[1]}%) · 자동 판정 미연결 ${fmt(localMissing)}개(${jo(localMissingBdg)})`}
          />
          <Stat
            tone="good"
            value={`${fmt(f.onthongWithBudget)}건`}
            label="예산을 바로 붙일 수 있는 온통청년 정책"
            note="이름·지역이 일치하는 재정사업의 예산현액·집행액을 인벤토리에 채움(엄격 기준)"
          />
        </div>
        <p className="footnote">
          ‘청년 세부사업’은 세부사업·단위사업명에 ‘청년’(또는 자립준비·대학생 등)이 들어간 사업입니다. 청년이 주 대상이어도 이름에 드러나지 않는 사업은 빠지므로 최소치입니다.
          지방은 같은 지자체·광역이 등록한 정책 중 이름과 대상 지역이 맞는 것을 자동으로 찾았고, 중앙은 한 건씩 대조했습니다.
          자동 판정은 표본 검토 기준으로 ‘있음’ 약 {f.accuracy.presence}%, ‘없음’ 약 {f.accuracy.absence}%가 맞았습니다. 온통청년에 같은 사업이 이름을 바꿔 여러 번 등록된 경우가 많아 1:1 연결이 어렵다는 것 자체가 정비 필요성을 보여줍니다.
        </p>
      </Section>

      <Section title="중앙 청년 세부사업 (열린재정)" lead="중앙 세부사업을 온통청년 정책과 한 건씩 대조했습니다. 국민취업지원제도·내일배움카드처럼 청년을 포함하는 전 연령 사업은 따로 표시합니다.">
        <div className="table-scroll">
          <table className="list-table">
            <thead>
              <tr><th>세부사업</th><th>소관</th><th className="num">예산현액</th><th className="num">집행률</th><th>온통청년</th></tr>
            </thead>
            <tbody>
              {f.central_rows.map((r) => (
                <tr key={`${r.org}-${r.nm}`} className={!r.link && r.tier !== 3 ? 'row-missing' : ''}>
                  <td>
                    {r.nm}
                    {r.tier === 2 && <Chip tone="info">청년 주대상</Chip>}
                    {r.tier === 3 && <Chip>청년 포함·전 연령</Chip>}
                    {r.unit && r.unit !== r.nm && <small className="muted block">{r.unit}</small>}
                  </td>
                  <td>{r.org}</td>
                  <td className="num">{eok(r.bdg)}</td>
                  <td className="num">{r.bdg ? pct(r.ep, r.bdg) : '-'}</td>
                  <td>
                    {r.link ? (
                      <>
                        <Chip tone={r.linkType === 'funds' ? 'ok' : 'info'}>{r.linkType === 'funds' ? '연결' : '일부 연결'}</Chip> {r.linkNm}
                      </>
                    ) : (
                      <>
                        <Chip tone="warn">없음</Chip> <small className="muted">{r.note}</small>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="광역별 지방 청년 세부사업 연결률" lead="지자체 청년 세부사업(본청·시군구 합산) 중 온통청년 정책과 연결된 비율. 대상자 지원형만 따로 봅니다.">
        <div className="table-scroll">
          <table className="list-table">
            <thead>
              <tr><th>광역</th><th className="num">청년 세부사업</th><th className="num">예산현액</th><th>연결률(예산 기준)</th><th className="num">대상자 지원형 연결률</th></tr>
            </thead>
            <tbody>
              {sidos.map((s) => {
                const a: FiscalAgg & { support: FiscalAgg } = f.bySido[s]
                return (
                  <tr key={s}>
                    <th>{s}</th>
                    <td className="num">{fmt(a.n)}</td>
                    <td className="num">{eok(a.bdg)}</td>
                    <td className="bar-cell wide"><Bar value={a.bdgLinked} max={a.bdg} tone="b" /> <span className="num">{pct(a.bdgLinked, a.bdg)}</span></td>
                    <td className="num">{pct(a.support.bdgLinked, a.support.bdg)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="온통청년에 없는 것으로 판정된 지방 청년 세부사업" lead={`예산현액이 큰 순서입니다. 자동 판정이므로 약 ${f.accuracy.absence}%만 실제로 없는 것으로 봐야 하며, 등록기관 확인 목록으로 씁니다. ‘대상자 지원형’은 수당·바우처·교육·일자리처럼 청년이 직접 신청하는 사업입니다.`}>
        <div className="filters card slim">
          <input className="search" type="search" placeholder="사업명·지자체 검색" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={sido} onChange={(e) => setSido(e.target.value)} aria-label="광역">
            <option value="all">전체 광역</option>
            {sidos.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value)} aria-label="사업 성격">
            <option value="대상자 지원">대상자 지원형</option>
            <option value="기반·운영">기반·운영형</option>
            <option value="기타">기타</option>
            <option value="all">전체</option>
          </select>
          <span className="result-count">{fmt(rows.length)}건</span>
        </div>
        <div className="table-scroll">
          <table className="list-table">
            <thead>
              <tr><th>세부사업</th><th>지자체</th><th>분야</th><th className="num">예산현액</th><th className="num">집행률</th><th>재원</th></tr>
            </thead>
            <tbody>
              {rows.slice(0, 150).map((r, i) => (
                <tr key={`${r.org}-${r.nm}-${i}`}>
                  <td>{r.nm}</td>
                  <td>{r.org}</td>
                  <td>{r.field}</td>
                  <td className="num">{eok(r.bdg)}</td>
                  <td className="num">{pct(r.ep, r.bdg)}</td>
                  <td>{r.gukbi ? <Chip tone="info">국비 포함</Chip> : <Chip>지방비</Chip>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > 150 && <p className="footnote">상위 150건만 표시합니다(예산현액 순, 최대 1,500건 수록).</p>}
      </Section>
    </>
  )
}
