import type { Dataset } from '../data'
import { fmt, pct } from '../data'
import { Bar, Section, Stat } from '../components'

export default function Diagnosis({ data }: { data: Dataset }) {
  const { policies, summary } = data
  const n = policies.length
  const open = policies.filter((p) => p.status !== '마감').length
  const noUrl = policies.filter((p) => !p.url).length
  const noScale = policies.filter((p) => p.scale == null).length
  const g24Link = Number(String(summary.profile['보조금24서비스ID링크'] ?? '0').replace(/[^\d].*$/, '').replace(/,/g, '')) || 0
  const plan1 = policies.filter((p) => p.plan.cycle === 1).length
  const m = summary.match
  const cats = Object.entries(summary.matchByCat).filter(([c]) => c !== '기타')

  return (
    <>
      <section className="hero">
        <p className="eyebrow">문제 제기</p>
        <h1>
          청년정책 {fmt(n)}건은 모여 있지만, <br className="br-wide" />
          <em>얼마를 쓰고 누가 받았는지</em>는 알 수 없습니다
        </h1>
        <p className="hero-lead">
          온통청년은 중앙·지자체 청년정책을 한곳에 모은 창구입니다. 그런데 지금의 등록 항목은 게시판 수준이어서, 정책 조정에 필요한
          예산·지원규모·성과를 볼 수 없고 자격 확인과 신청은 기관별로 흩어져 있습니다. 이 PoC는 같은 공개 데이터를 <strong>정책 인벤토리</strong>로
          재구성하고, 자격 판정·신청은 <strong>보조금24</strong>에 잇는 역할 분담을 실제 데이터로 시연합니다.
        </p>
        <div className="hero-actions">
          <a className="btn primary" href="#/inventory">인벤토리 둘러보기</a>
          <a className="btn" href="#/design">설계안 보기</a>
        </div>
      </section>

      <Section title="지금 온통청년 데이터로 알 수 있는 것과 없는 것" lead={`공개 정책검색 결과 ${fmt(n)}건 전수 분석 (${summary.stamp} 기준)`}>
        <div className="stat-grid">
          <Stat tone="warn" value={pct(open, n)} label="지금 신청할 수 있는 정책" note={`상시·진행중 ${fmt(open)}건, 나머지는 마감`} />
          <Stat tone="warn" value={pct(noUrl, n)} label="신청 경로(URL) 미기재" note={`${fmt(noUrl)}건 — 어디서 신청하는지 알 수 없음`} />
          <Stat tone="warn" value={pct(noScale, n)} label="지원규모 미기재(공란·0)" note={`${fmt(noScale)}건`} />
          <Stat tone="warn" value="0개" label="예산·수혜실적·성과 항목" note="등록 항목 자체가 없음" />
          <Stat tone="warn" value={pct(g24Link, n)} label="보조금24 서비스와 직접 연결" note={`${fmt(g24Link)}건만 링크로 연결`} />
          <Stat tone="warn" value={pct(plan1, n)} label="1차 기본계획 과제에 매핑된 정책" note={`${fmt(plan1)}건 — 대부분 2025년 등록분, 1·2차 과제번호 혼재`} />
        </div>
      </Section>

      <Section
        title="같은 데이터를 인벤토리로 바꾸면"
        lead="기관코드 정규화 → 정책명 유사도 → 지원내용 유사도의 3단계 자동 매칭만으로 이만큼 연결됩니다."
      >
        <div className="stat-grid three">
          <Stat
            tone="good"
            value={pct(m.all.matched, m.all.n)}
            label="보조금24 서비스와 자동 연결"
            note={`${fmt(m.all.matched)}건 — 높음 ${fmt(m.all.high)}(정밀도 ${summary.precision?.high ?? '-'}%) · 중간 ${fmt(m.all.matched - m.all.high)}(${summary.precision?.mid ?? '-'}%) · 현재 직접 링크 ${fmt(g24Link)}건`}
          />
          <Stat
            tone="good"
            value={fmt(summary.conditions.anyDiff)}
            label="두 시스템의 자격조건이 다르게 등록"
            note={`연결된 ${fmt(summary.conditions.pairs)}쌍 중 · 실질 차이 ${fmt(summary.conditions.substantive)} · 나머지는 한쪽만 기재·표기 차이`}
          />
          <Stat
            tone="good"
            value={fmt(summary.gov24YouthUnmatched)}
            label="온통청년에서 안 보이는 보조금24 청년 서비스"
            note={`보조금24 청년 관련 ${fmt(summary.gov24Youth)}건 중 온통청년 미연결`}
          />
        </div>

        <div className="split">
          <div className="card">
            <h3>제공주체별 자동 연결률</h3>
            <table className="rate-table">
              <tbody>
                {(['중앙', '지자체'] as const).map((g) => (
                  <tr key={g}>
                    <th>{g}</th>
                    <td className="bar-cell"><Bar value={m[g].matched} max={m[g].n} /></td>
                    <td className="num">{pct(m[g].matched, m[g].n)}</td>
                    <td className="num muted">{fmt(m[g].matched)}/{fmt(m[g].n)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            <h3>분야별 자동 연결률</h3>
            <table className="rate-table">
              <tbody>
                {cats.map(([c, r]) => (
                  <tr key={c}>
                    <th>{c}</th>
                    <td className="bar-cell"><Bar value={r.matched} max={r.n} tone="b" /></td>
                    <td className="num">{pct(r.matched, r.n)}</td>
                    <td className="num muted">{fmt(r.matched)}/{fmt(r.n)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="footnote">
          연결되지 않은 {fmt(m.all.n - m.all.matched)}건에는 참여·행사처럼 보조금24 등록 대상이 아닌 사업과, 대상이지만 아직 등록되지 않았거나 이름이 크게 달라 자동으로 찾지 못한 사업이
          섞여 있습니다. 둘을 가르는 것이 인벤토리 정비의 첫 작업입니다(점수 0.6~0.7 확인 후보 {fmt(summary.reviewCandidates ?? 0)}건 별도). <a href="#/method">매칭 방법과 정확도 →</a>
        </p>
      </Section>

      <Section title="역할 분담 제안">
        <div className="roles">
          <div className="role">
            <p className="role-tag">온통청년 → 인벤토리</p>
            <h3>무엇을, 얼마나, 왜</h3>
            <ul>
              <li>범정부 청년정책의 단일 목록과 정책 ID</li>
              <li>예산·지원규모·수혜실적·성과지표</li>
              <li>기본계획 과제와의 연결, 중복·사각지대 진단</li>
            </ul>
          </div>
          <div className="role-link" aria-hidden>
            <span>서비스ID로 연결</span>
          </div>
          <div className="role">
            <p className="role-tag alt">보조금24 → 판정·신청</p>
            <h3>나는 받을 수 있나, 어디서</h3>
            <ul>
              <li>행정정보 기반 자격 판정(로그인·동의)</li>
              <li>표준 자격조건 코드(연령·소득·가구)</li>
              <li>신청·접수 경로 일원화</li>
            </ul>
          </div>
        </div>
      </Section>
    </>
  )
}
