import { useEffect, useMemo, useState } from 'react'
import type { Dataset } from '../data'
import { ageText, completeness, fmt } from '../data'
import type { Policy } from '../types'
import { Chip } from '../components'

const PAGE = 30
type Link = 'all' | 'linked' | 'unlinked' | 'diff'

export default function Inventory({ data }: { data: Dataset }) {
  const { policies } = data
  const [q, setQ] = useState('')
  const [grp, setGrp] = useState('all')
  const [sido, setSido] = useState('all')
  const [cat, setCat] = useState('all')
  const [status, setStatus] = useState('all')
  const [link, setLink] = useState<Link>('all')
  const [shown, setShown] = useState(PAGE)
  const [selected, setSelected] = useState<Policy | null>(null)

  const sidos = useMemo(() => [...new Set(policies.map((p) => p.sido))].filter((s) => s !== '중앙').sort(), [policies])
  const cats = useMemo(() => [...new Set(policies.map((p) => p.cat))].sort(), [policies])

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase()
    return policies.filter((p) => {
      if (kw && !`${p.nm} ${p.inst} ${p.expl}`.toLowerCase().includes(kw)) return false
      if (grp !== 'all' && p.grp !== grp) return false
      if (sido !== 'all' && p.sido !== sido) return false
      if (cat !== 'all' && p.cat !== cat) return false
      if (status === 'open' && p.status === '마감') return false
      if (status === 'closed' && p.status !== '마감') return false
      if (link === 'linked' && !p.g24) return false
      if (link === 'unlinked' && p.g24) return false
      if (link === 'diff' && !(p.diff?.age || p.diff?.inc)) return false
      return true
    })
  }, [policies, q, grp, sido, cat, status, link])

  useEffect(() => {
    setShown(PAGE)
  }, [q, grp, sido, cat, status, link])

  const linked = filtered.filter((p) => p.g24).length

  return (
    <>
      <div className="page-head">
        <h1>청년정책 인벤토리</h1>
        <p className="lead">
          온통청년 정책마다 <strong>통합 ID</strong>(온통청년 정책번호 · 보조금24 서비스ID · 기본계획 과제번호)와 <strong>필수 항목 충족도</strong>를 붙였습니다.
          보조금24와 연결된 정책은 그쪽에서 바로 자격 확인·신청으로 이어집니다.
        </p>
      </div>

      <div className="filters card">
        <input className="search" type="search" placeholder="정책명·기관·내용 검색 (예: 월세, 면접수당)" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="filter-row">
          <select value={grp} onChange={(e) => setGrp(e.target.value)} aria-label="제공주체">
            <option value="all">중앙+지자체</option>
            <option value="중앙">중앙부처</option>
            <option value="지자체">지자체</option>
          </select>
          <select value={sido} onChange={(e) => setSido(e.target.value)} aria-label="지역">
            <option value="all">전체 지역</option>
            {sidos.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="분야">
            <option value="all">전체 분야</option>
            {cats.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="신청상태">
            <option value="all">신청상태 전체</option>
            <option value="open">신청 가능(상시·진행중)</option>
            <option value="closed">마감</option>
          </select>
          <div className="seg" role="group" aria-label="보조금24 연결">
            {([['all', '전체'], ['linked', '보조금24 연결'], ['unlinked', '미연결'], ['diff', '조건 불일치']] as const).map(([k, l]) => (
              <button key={k} className={link === k ? 'on' : ''} onClick={() => setLink(k)}>{l}</button>
            ))}
          </div>
        </div>
        <p className="result-count">
          {fmt(filtered.length)}건 · 보조금24 연결 {fmt(linked)}건
        </p>
      </div>

      <ul className="policy-list">
        {filtered.slice(0, shown).map((p) => (
          <PolicyRow key={p.id} p={p} onOpen={() => setSelected(p)} />
        ))}
      </ul>
      {shown < filtered.length && (
        <div className="more">
          <button className="btn" onClick={() => setShown((s) => s + PAGE)}>더 보기 ({fmt(filtered.length - shown)}건 남음)</button>
        </div>
      )}
      {selected && <Detail p={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

function statusChip(p: Policy) {
  if (p.status === '마감') return <Chip tone="muted">마감</Chip>
  if (p.status === '상시') return <Chip tone="ok">상시</Chip>
  return <Chip tone="info">진행중</Chip>
}

function PolicyRow({ p, onOpen }: { p: Policy; onOpen: () => void }) {
  const fields = completeness(p)
  const filled = fields.filter((f) => f.ok).length
  return (
    <li className="policy">
      <button className="policy-btn" onClick={onOpen}>
        <div className="policy-top">
          {statusChip(p)}
          <Chip>{p.grp === '중앙' ? '중앙' : p.sido}</Chip>
          <Chip>{p.cat}</Chip>
          {(p.diff?.age || p.diff?.inc) && (
            <Chip tone="warn">{p.diff?.ageKind === '실질 차이' || p.diff?.incKind === '실질 차이' ? '조건 실질 차이' : '조건 표기 차이'}</Chip>
          )}
        </div>
        <h3>{p.nm}</h3>
        <p className="policy-inst">{p.inst}</p>
        <div className="idrow">
          <span className="idbox"><em>온통청년</em>{p.id}</span>
          <span className={`idbox ${p.g24 ? 'on' : 'off'}`}><em>보조금24</em>{p.g24 ? p.g24.id : '미연결'}</span>
          <span className={`idbox ${p.plan.cycle === 2 ? 'on' : 'off'}`}>
            <em>기본계획</em>{p.plan.cycle ? `${p.plan.cycle}차-${p.plan.asmt || '?'}` : '없음'}
          </span>
        </div>
        <div className="fill" title={fields.map((f) => `${f.ok ? '●' : '○'} ${f.key}`).join('\n')}>
          {fields.map((f) => <i key={f.key} className={f.ok ? 'ok' : ''} />)}
          <span>필수항목 {filled}/{fields.length}</span>
        </div>
      </button>
    </li>
  )
}

function Detail({ p, onClose }: { p: Policy; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const g = p.g24
  const fields = completeness(p)
  const onAge = ageText(p.ageMin, p.ageMax)
  const gAge = g ? ageText(g.ageMin, g.ageMax) : ''
  const onInc = p.earn === '무관' ? '소득 무관' : p.earnTxt || p.earn
  const gInc = p.diff?.incG24 ? (p.diff.incG24 >= 999 ? '제한 없음' : `중위소득 ${p.diff.incG24}% 이하 구간`) : '제한 없음(코드 미지정)'

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={p.nm}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="닫기">×</button>
        <div className="policy-top">
          {statusChip(p)}
          <Chip>{p.grp === '중앙' ? '중앙' : p.sido}</Chip>
          <Chip>{p.catRaw || p.cat}</Chip>
          {p.oldCat && <Chip tone="warn">구 분류체계</Chip>}
        </div>
        <h2>{p.nm}</h2>
        <p className="policy-inst">{p.inst}{p.region ? ` · ${p.region}` : ''}</p>
        {p.expl && <p className="drawer-text">{p.expl}</p>}
        {p.sprt && <p className="drawer-text muted">{p.sprt}</p>}

        <h4>인벤토리 필수 항목</h4>
        <ul className="checklist">
          {fields.map((f) => (
            <li key={f.key} className={f.ok ? 'ok' : 'no'}>
              <span>{f.ok ? '✓' : '—'}</span>{f.key}
              {!f.ok && ['예산', '수혜실적', '성과지표'].includes(f.key) && <small>현재 등록 항목 없음</small>}
            </li>
          ))}
        </ul>

        <h4>보조금24 연결</h4>
        {g ? (
          <>
            <div className="g24card">
              <div>
                <Chip tone={g.conf === '높음' ? 'ok' : 'info'}>매칭 신뢰도 {g.conf}</Chip>
                <p className="g24-name">{g.nm}</p>
                <p className="muted small">{g.inst} · {g.type} · 접수 {g.recv}</p>
              </div>
              <a className="btn primary" href={g.url} target="_blank" rel="noreferrer">보조금24에서 보기 ↗</a>
            </div>
            <table className="compare">
              <thead>
                <tr><th /><th>온통청년 등록값</th><th>보조금24 표준코드</th></tr>
              </thead>
              <tbody>
                <tr className={p.diff?.age ? 'diff' : ''}>
                  <th>연령{p.diff?.ageKind && <small className="kind">{p.diff.ageKind}</small>}</th><td>{onAge}</td><td>{gAge}</td>
                </tr>
                <tr className={p.diff?.inc ? 'diff' : ''}>
                  <th>소득{p.diff?.incKind && <small className="kind">{p.diff.incKind}</small>}</th><td>{onInc}</td><td>{gInc}</td>
                </tr>
                <tr>
                  <th>신청</th><td>{p.url ? <a href={p.url} target="_blank" rel="noreferrer">등록 URL ↗</a> : '미기재'}</td><td>{g.apply.replaceAll('||', ', ')}</td>
                </tr>
              </tbody>
            </table>
            {(p.diff?.age || p.diff?.inc) && (
              <p className="footnote warn-text">두 시스템의 자격조건이 다릅니다. 인벤토리에서는 한 곳(등록기관)이 기준값을 관리하고 다른 쪽은 이를 참조해야 합니다.</p>
            )}
          </>
        ) : (
          <p className="drawer-text muted">
            자동 매칭으로 대응하는 보조금24 서비스를 찾지 못했습니다. 현금·바우처형이면 보조금24 등록 대상, 참여·행사형이면 인벤토리에만 두고 유형을 표시합니다.
          </p>
        )}

        <h4>등록 정보</h4>
        <dl className="meta">
          <dt>정책번호</dt><dd>{p.id}</dd>
          <dt>기본계획</dt><dd>{p.plan.cycle ? `${p.plan.cycle}차 · 과제 ${p.plan.asmt || '미지정'}` : '미지정'}</dd>
          <dt>지원규모</dt><dd>{p.scale != null ? `${fmt(p.scale)}명(건)` : '미기재'}</dd>
          <dt>최초등록 / 최종수정</dt><dd>{p.reg} / {p.mod}</dd>
          <dt>조회수</dt><dd>{p.views != null ? fmt(p.views) : '-'}</dd>
        </dl>
      </div>
    </div>
  )
}
