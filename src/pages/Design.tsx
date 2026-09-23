import type { Dataset } from '../data'
import { fmt, pct } from '../data'
import { Section } from '../components'

const SCHEMA = [
  { group: '식별', field: '인벤토리 정책 ID', now: '온통청년 정책번호(있음)', to: '유지 — 모든 연계의 기준 키' },
  { group: '식별', field: '보조금24 서비스ID', now: '없음(URL에 일부 기재)', to: '필수 연결 키, 현금·바우처형은 의무' },
  { group: '식별', field: '기본계획 과제번호', now: '1·2차 혼재', to: '현행 계획 과제로 일괄 재매핑' },
  { group: '식별', field: '소관기관코드', now: '부서 단위 코드', to: '기관 단위 코드 병기(행정표준기관코드)' },
  { group: '재정', field: '예산(본예산·추경)', now: '항목 없음', to: '연도별 금액, 재원(국비·지방비) 구분' },
  { group: '재정', field: '재정사업 코드', now: '항목 없음', to: 'e나라도움·지방재정 세부사업 코드 연결' },
  { group: '규모·성과', field: '지원규모', now: '61% 공란·0', to: '계획 인원(건) 필수' },
  { group: '규모·성과', field: '수혜실적', now: '항목 없음', to: '연 1회 실적 인원·집행액' },
  { group: '규모·성과', field: '성과지표', now: '항목 없음', to: '지표명·목표·실적(성과계획서 연동)' },
  { group: '자격', field: '연령·소득·가구 조건', now: '자유 입력 + 일부 코드', to: '보조금24 표준 조건코드(JA)로 통일' },
  { group: '자격', field: '사업유형', now: '분류체계 2종 혼재', to: '단일 분류 + 표준 사업유형(월세·면접수당 등)' },
  { group: '관리', field: '기준일·갱신 책임', now: '최종수정일만', to: '기준일, 등록기관 담당 부서, 다음 갱신 예정일' },
]

export default function Design({ data }: { data: Dataset }) {
  const { summary } = data
  const m = summary.match.all
  return (
    <>
      <div className="page-head">
        <h1>인벤토리 설계안</h1>
        <p className="lead">
          새 시스템을 만들기보다, 이미 있는 두 시스템의 역할을 나누고 <strong>ID 하나로 잇는 것</strong>이 핵심입니다. 청년정책 전담조직이 정책을 조정하려면 먼저 이
          목록이 있어야 합니다.
        </p>
      </div>

      <Section title="ID 체계">
        <div className="idchain">
          <div className="idnode"><em>온통청년 정책 ID</em><code>2026MMDD005400…</code><span>인벤토리 기준 키</span></div>
          <div className="idarrow">⇄</div>
          <div className="idnode"><em>보조금24 서비스ID</em><code>000000465790</code><span>자격 판정·신청</span></div>
          <div className="idarrow">⇄</div>
          <div className="idnode"><em>기본계획 과제번호</em><code>2차-027</code><span>정책 목표·조정</span></div>
          <div className="idarrow">⇄</div>
          <div className="idnode"><em>재정사업 코드</em><code>세부사업</code><span>예산·집행</span></div>
        </div>
        <p className="footnote">
          PoC에서는 첫 연결(온통청년 ⇄ 보조금24)을 자동 매칭으로 {pct(m.matched, m.n)}까지 복원했습니다. 나머지 연결은 등록 단계에서 필수 입력으로 받는 것이 정확합니다.
        </p>
      </Section>

      <Section title="표준 항목 (현재 → 인벤토리)">
        <div className="table-scroll">
          <table className="list-table schema">
            <thead><tr><th>구분</th><th>항목</th><th>현재 온통청년</th><th>인벤토리 기준</th></tr></thead>
            <tbody>
              {SCHEMA.map((r) => (
                <tr key={r.field}>
                  <td className="muted">{r.group}</td>
                  <th>{r.field}</th>
                  <td>{r.now}</td>
                  <td>{r.to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="갱신 책임과 주기">
        <div className="steps">
          <div className="step"><b>등록기관</b><p>사업 신설·변경 시 즉시 등록, 보조금24 서비스ID 병기. 연 1회 예산·실적 갱신.</p></div>
          <div className="step"><b>보조금24</b><p>자격조건 표준코드의 원천. 인벤토리는 조건을 복제하지 않고 서비스ID로 참조.</p></div>
          <div className="step"><b>청년정책 총괄조직</b><p>분기별 정합성 점검(미연결·불일치·장기 미갱신 목록) 공표, 기본계획 과제 매핑 관리.</p></div>
        </div>
      </Section>

      <Section title="단계별 추진 (안)">
        <ol className="roadmap">
          <li><b>1단계 · 연결 복원</b> 자동 매칭 결과를 등록기관이 확인·확정 ({fmt(m.matched)}건 검수, 미연결 {fmt(m.n - m.matched)}건 유형 분류)</li>
          <li><b>2단계 · 항목 표준화</b> 예산·규모·실적·성과 항목 신설, 자격조건은 보조금24 코드로 통일</li>
          <li><b>3단계 · 서비스 연계</b> 온통청년 상세 화면에 “보조금24에서 자격 확인” 연결, 조건 불일치 자동 점검</li>
          <li><b>4단계 · 정책 조정</b> 유사·중복 사업, 사각지대 목록을 정기 산출해 전담조직의 조정 자료로 활용</li>
        </ol>
      </Section>
    </>
  )
}
