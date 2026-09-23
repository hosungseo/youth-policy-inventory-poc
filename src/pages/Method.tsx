import type { Dataset } from '../data'
import { fmt } from '../data'
import { Section } from '../components'

export default function Method({ data }: { data: Dataset }) {
  const { summary } = data
  const pr = summary.precision
  return (
    <>
      <div className="page-head">
        <h1>방법과 한계</h1>
        <p className="lead">모든 수치는 공개 데이터에서 자동으로 계산했습니다. 공식 통계가 아니며, 재현 가능한 추정치입니다.</p>
      </div>

      <Section title="데이터">
        <ul className="plain">
          <li>온통청년 공개 정책검색 결과 {fmt(summary.total)}건 ({summary.stamp} 수집). 온통청년 검색 화면에 표시되는 건수와 같습니다(지역 필터 결과도 일치 확인).</li>
          <li>공공데이터포털 「행정안전부_대한민국 공공서비스(혜택) 정보」 목록·상세·지원조건 각 {fmt(summary.gov24Total)}건.</li>
          <li>담당자 성명·연락처, 등록·수정자 관련 항목은 수집 즉시 제외했고 이 사이트에 싣지 않았습니다.</li>
        </ul>
      </Section>

      <Section title="자동 매칭 3단계">
        <ol className="roadmap">
          <li><b>기관 정규화</b> 온통청년은 부서 단위 기관코드(예: ○○시 청년정책담당관), 보조금24는 기관 단위 코드를 씁니다. 부서 코드를 상위 기관 코드로 올려 비교 후보를 정합니다(96% 해소).</li>
          <li><b>정책명 유사도</b> 지역명·연도·괄호·일반어(지원사업 등)를 걷어낸 뒤 글자 단위 유사도로 비교합니다.</li>
          <li><b>지원내용 유사도</b> 설명·지원내용 본문의 TF-IDF 유사도를 보조 신호로 씁니다. 다른 지역의 같은 이름 사업은 중앙행정기관·공공기관 사업일 때만 후보로 둡니다.</li>
        </ol>
      </Section>

      <Section title="정확도 검증">
        {pr ? (
          <p>
            점수 구간별로 층화한 표본 {fmt(pr.sample)}쌍을 AI가 서로 다른 관점(동일성 판정 · 차이 적발)으로 두 번, 점수를 보지 않고 판정했고(일치율 94%), 엇갈린 12쌍은 원문을 대조해 확정했습니다. 사람이 직접 확인한 표본은 아직 없습니다.
            그 결과 점수 0.8 이상(‘높음’)은 약 {pr.high}%, 0.7~0.8(‘중간’)은 약 {pr.mid}%가 올바른 연결이었습니다. ‘중간’에는 시·군 집행 사업을 광역·중앙의 상위 서비스에 잇는 경우가 많습니다.
            0.7 미만은 정밀도가 50% 안팎으로 떨어져 연결로 세지 않았고, 그중 0.6~0.7 구간 {fmt(summary.reviewCandidates ?? 0)}건은 등록기관 확인 후보로 남겨 두었습니다.
          </p>
        ) : (
          <p>표본 검증 결과 반영 중입니다.</p>
        )}
      </Section>

      <Section title="재정 연계 (지방재정365 · 열린재정)">
        <ul className="plain">
          <li>지방: 지방재정365 세부사업별 세출현황 {fmt(data.fiscal.local.n)}개 청년 세부사업({data.fiscal.asofLocal} 기준). 세부사업코드 앞 7자리가 행정표준기관코드여서 온통청년 기관코드와 바로 대응합니다. 같은 지자체와 그 광역이 직접 등록한 정책, 국비가 섞인 경우 중앙 정책까지를 후보로 두고 사업명 유사도로 찾았습니다.</li>
          <li>중앙: 열린재정 세부사업 일별 집행현황({data.fiscal.asofCentral} 기준)에서 세부·단위·프로그램명에 ‘청년’이 들어간 사업과, 국가장학금처럼 청년이 주 대상인 사업을 골라 온통청년과 한 건씩 대조했습니다.</li>
          <li>한 정책을 광역·시군이 나눠 편성하거나(도비·시군비), 이월분이 따로 잡히면 여러 세부사업이 한 정책에 붙습니다. 사업 성격은 이름으로 ‘대상자 지원’과 ‘기반·운영’을 나눈 추정입니다.</li>
          <li>
            지방 자동 판정은 층화 표본 {fmt(data.fiscal.accuracy.sample)}건을 AI가 두 관점(연결 판정 · 누락 적발과 온통청년 전체 재검색)으로 판정한 결과로 보정했습니다. ‘있음/없음’ 판정은 각각 약 {data.fiscal.accuracy.presence}%·{data.fiscal.accuracy.absence}%가 맞았고,
            정책별 예산 연결(이름·지역 일치 엄격 기준)은 약 {data.fiscal.accuracy.strict}%가 맞았습니다. ‘온통청년에 없는 비율’은 표본을 점수 구간별 모집단 크기로 가중해 추정했습니다(약 {data.fiscal.estimate.absentShare}%, 95% 구간 {data.fiscal.estimate.ci[0]}~{data.fiscal.estimate.ci[1]}%).
          </li>
        </ul>
      </Section>

      <Section title="한계">
        <ul className="plain">
          <li>매칭되지 않았다고 해서 보조금24에 없는 것은 아닙니다. 사업명이 크게 다르거나 다른 기관 명의로 등록된 경우 놓칠 수 있습니다.</li>
          <li>조건 비교는 연령 상한(숫자)과 소득(중위소득 비율 문구)만 봅니다. 차이는 ‘표기 차이(±1세, 미만·이하 기준)’, ‘한쪽만 기재’, ‘실질 차이’로 나눴습니다. 보조금24 소득 조건은 구간 코드여서 세부 기준은 비교하지 못합니다.</li>
          <li>유사 사업 집계는 정책명 키워드 기준이라 대상·금액이 다른 사업이 함께 묶일 수 있습니다.</li>
          <li>재정사업 ‘청년’ 판별은 이름 기준이라, 청년이 주 대상이지만 이름에 드러나지 않는 사업은 빠집니다. 온통청년에 없다는 목록은 자동 연결 기준이므로 등록기관 확인이 필요합니다.</li>
        </ul>
      </Section>
    </>
  )
}
