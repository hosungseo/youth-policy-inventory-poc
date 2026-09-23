import { useEffect, useState } from 'react'
import { useDataset } from './data'
import Diagnosis from './pages/Diagnosis'
import Inventory from './pages/Inventory'
import Overlap from './pages/Overlap'
import Design from './pages/Design'
import Method from './pages/Method'

const TABS = [
  { id: 'diagnosis', label: '진단' },
  { id: 'inventory', label: '인벤토리' },
  { id: 'overlap', label: '중복·사각지대' },
  { id: 'design', label: '설계안' },
  { id: 'method', label: '방법·한계' },
] as const
type TabId = (typeof TABS)[number]['id']

const readHash = (): TabId => {
  const h = window.location.hash.replace('#/', '').split('?')[0]
  return (TABS.find((t) => t.id === h)?.id ?? 'diagnosis') as TabId
}

export default function App() {
  const [tab, setTab] = useState<TabId>(readHash)
  const { data, error } = useDataset()

  useEffect(() => {
    const onHash = () => setTab(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [tab])

  return (
    <>
      <div className="poc-banner">
        비공식 개념검증(PoC) · 공개 데이터 기반 · 실제 온통청년·보조금24 서비스가 아닙니다
      </div>
      <header className="site-header">
        <div className="wrap header-inner">
          <a className="brand" href="#/diagnosis">
            <span className="brand-mark" aria-hidden>
              <i /><i /><i />
            </span>
            <span>
              <strong>청년정책 인벤토리</strong>
              <small>온통청년 × 보조금24 연계 PoC</small>
            </span>
          </a>
          <nav className="tabs" aria-label="주요 메뉴">
            {TABS.map((t) => (
              <a key={t.id} href={`#/${t.id}`} className={t.id === tab ? 'active' : ''} aria-current={t.id === tab ? 'page' : undefined}>
                {t.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main className="wrap">
        {error && <p className="notice error">데이터를 불러오지 못했습니다: {error}</p>}
        {!data && !error && <p className="notice">데이터를 불러오는 중…</p>}
        {data && tab === 'diagnosis' && <Diagnosis data={data} />}
        {data && tab === 'inventory' && <Inventory data={data} />}
        {data && tab === 'overlap' && <Overlap data={data} />}
        {data && tab === 'design' && <Design data={data} />}
        {data && tab === 'method' && <Method data={data} />}
      </main>
      <footer className="site-footer">
        <div className="wrap">
          <p>
            자료: 온통청년 공개 정책검색({data?.summary.stamp ?? '2026-09-23'} 수집), 공공데이터포털 「행정안전부_대한민국 공공서비스(혜택) 정보」.
            담당자 성명·연락처 등 개인 관련 항목은 싣지 않았습니다.
          </p>
          <p>매칭 결과는 자동 추정치이며 행정기관의 공식 입장이 아닙니다.</p>
        </div>
      </footer>
    </>
  )
}
