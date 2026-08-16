"use client";

import { FormEvent, useMemo, useState } from "react";

type AgencyCode = "kosmes" | "semas" | "kodit" | "kibo" | "regional" | "nongshinbo" | "ksure";
type Result = Agency & { score: number; grade: string; gated: boolean };

type Agency = {
  code: AgencyCode;
  short: string;
  name: string;
  type: string;
  focus: string;
  oneLine: string;
  weights: number[];
  callPoint: string;
};

type FormData = {
  companyName: string;
  industry: string;
  ageBand: string;
  annualRevenue: string;
  debtAmount: string;
  arrears: string;
  revenueProfile: string;
  debtProfile: string;
  credit: string;
  smallBusiness: string;
  technology: string;
  employees: string;
  exportStatus: string;
  region: string;
  purpose: string;
  needAmount: string;
};

const agencies: Agency[] = [
  { code: "kosmes", short: "중진공", name: "중소벤처기업진흥공단", type: "직접융자", focus: "성장성 · 사업성 · 고용", oneLine: "성장·시설투자를 준비하는 중소기업", weights: [15, 10, 20, 15, 15, 10, 10, 5], callPoint: "자금이 필요한 사업 단계와 투자 효과를 숫자로 설명하세요." },
  { code: "semas", short: "소진공", name: "소상공인시장진흥공단", type: "직접융자", focus: "소상공인 요건 · 신용", oneLine: "생활밀착형 소상공인과 소규모 사업자", weights: [25, 10, 15, 15, 20, 10, 3, 2], callPoint: "업종, 직원 수, 자금 용도를 첫 통화에서 바로 답하세요." },
  { code: "kodit", short: "신보", name: "신용보증기금", type: "보증", focus: "매출 · 이익 · 상환능력", oneLine: "재무 기반이 갖춰진 일반 중소기업", weights: [10, 10, 25, 20, 15, 10, 5, 5], callPoint: "대출이 아니라 보증 상담이라고 말하고 회사 숫자를 준비하세요." },
  { code: "kibo", short: "기보", name: "기술보증기금", type: "기술보증", focus: "기술성 · 특허 · 사업화", oneLine: "기술·특허·R&D 역량을 가진 기업", weights: [10, 5, 10, 15, 15, 10, 30, 5], callPoint: "핵심 기술과 경쟁사 대비 차이를 2~3문장으로 준비하세요." },
  { code: "regional", short: "지역신보", name: "지역신용보증재단", type: "지역보증", focus: "소재지 · 신용 · 영업실체", oneLine: "지역 기반 소기업과 소상공인", weights: [15, 10, 15, 15, 20, 15, 5, 5], callPoint: "사업장 소재지를 먼저 밝히고 현재 가능한 특례를 물으세요." },
  { code: "nongshinbo", short: "농신보", name: "농림수산업자신용보증기금", type: "농림수산 보증", focus: "업종 관련성 · 영농실체", oneLine: "농림수산업 종사자와 관련 법인", weights: [30, 10, 10, 15, 20, 10, 3, 2], callPoint: "경영체 등록, 품목·면적, 출하 구조를 먼저 정리하세요." },
  { code: "ksure", short: "무보", name: "한국무역보험공사", type: "수출 보험·보증", focus: "수출실적 · 계약 · 바이어", oneLine: "수출실적 또는 확정 수출계약이 있는 기업", weights: [10, 5, 15, 10, 15, 5, 10, 30], callPoint: "수출국, 품목, 계약금액, 바이어 정보를 준비하세요." },
];

const industryOptions = [
  ["manufacturing", "제조업"], ["knowledge", "기술·지식서비스"], ["retail", "도소매업"],
  ["food", "음식·숙박업"], ["service", "일반 서비스업"], ["construction", "건설·운수업"],
  ["agriculture", "농림수산업"], ["foodProcessing", "농수산물 가공·유통"],
];

const initialForm: FormData = {
  companyName: "", industry: "", ageBand: "", annualRevenue: "", debtAmount: "", arrears: "",
  revenueProfile: "", debtProfile: "", credit: "", smallBusiness: "", technology: "unknown",
  employees: "", exportStatus: "none", region: "", purpose: "", needAmount: "",
};

const ratios: Record<string, number> = {
  best: 1, good: 0.7, medium: 0.5, weak: 0.3, none: 0, unknown: 0.5,
};

const industryFit: Record<string, Record<AgencyCode, number>> = {
  manufacturing: { kosmes: 1, semas: 0.6, kodit: 0.6, kibo: 0.6, regional: 0.6, nongshinbo: 0, ksure: 0.6 },
  knowledge: { kosmes: 1, semas: 0.6, kodit: 0.6, kibo: 1, regional: 0.6, nongshinbo: 0, ksure: 0.6 },
  retail: { kosmes: 0.3, semas: 1, kodit: 0.6, kibo: 0.3, regional: 1, nongshinbo: 0, ksure: 0.3 },
  food: { kosmes: 0.3, semas: 1, kodit: 0.6, kibo: 0.3, regional: 1, nongshinbo: 0.3, ksure: 0.3 },
  service: { kosmes: 0.6, semas: 1, kodit: 0.6, kibo: 0.6, regional: 1, nongshinbo: 0, ksure: 0.3 },
  construction: { kosmes: 0.6, semas: 0.6, kodit: 0.6, kibo: 0.6, regional: 0.6, nongshinbo: 0, ksure: 0.3 },
  agriculture: { kosmes: 0.3, semas: 0.6, kodit: 0.6, kibo: 0.3, regional: 0.6, nongshinbo: 1, ksure: 0.3 },
  foodProcessing: { kosmes: 0.6, semas: 0.6, kodit: 0.6, kibo: 0.3, regional: 0.6, nongshinbo: 0.3, ksure: 0.6 },
};

const money = (value: string) => value ? `${value}억원` : "[통화 전 확인]";
const labelOf = (items: string[][], value: string) => items.find(([key]) => key === value)?.[1] || "[기업 확인 필요]";

function scoreAgencies(form: FormData): Result[] {
  const variableRatios = (agency: Agency) => {
    const age = { over5: 1, threeToFive: 0.7, oneToThree: 0.5, under1: 0.3 }[form.ageBand] ?? 0;
    const finance = ratios[form.revenueProfile] ?? 0.5;
    const debt = ratios[form.debtProfile] ?? 0.5;
    const arrears = { clean: 1, past: 0.5, recent: 0.2, current: 0 }[form.arrears] ?? 0;
    const credit = ratios[form.credit] ?? 0.5;
    const tech = ratios[form.technology] ?? 0.5;
    let employmentExport = 0;
    if (form.exportStatus === "actual" || Number(form.employees) >= 10) employmentExport = 1;
    else if (form.exportStatus === "contract" || Number(form.employees) >= 5) employmentExport = 0.7;
    else if (form.exportStatus === "plan" || Number(form.employees) >= 1) employmentExport = 0.4;
    const fit = industryFit[form.industry]?.[agency.code] ?? 0.3;
    return [fit, age, finance, debt, arrears, credit, tech, employmentExport];
  };

  return agencies.map((agency) => {
    const score = Math.round(variableRatios(agency).reduce((sum, ratio, i) => sum + ratio * agency.weights[i], 0));
    const gated = form.arrears === "current"
      || (agency.code === "semas" && form.smallBusiness === "no")
      || (agency.code === "nongshinbo" && !["agriculture", "foodProcessing"].includes(form.industry))
      || (agency.code === "ksure" && !["actual", "contract"].includes(form.exportStatus));
    const grade = gated ? "현재 불가" : score >= 70 ? "가능성 높음" : score >= 40 ? "조건부 가능" : "현재 불가";
    return { ...agency, score, grade, gated };
  }).sort((a, b) => Number(a.gated) - Number(b.gated) || b.score - a.score);
}

export default function Home() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [step, setStep] = useState(1);
  const [results, setResults] = useState<Result[] | null>(null);
  const [selected, setSelected] = useState<AgencyCode>("kosmes");
  const selectedAgency = (results || agencies).find((agency) => agency.code === selected) || agencies[0];

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;
  const requiredDone = useMemo(() => {
    if (step === 1) return Boolean(form.industry && form.ageBand && form.annualRevenue && form.debtAmount && form.arrears);
    if (step === 2) return Boolean(form.revenueProfile && form.debtProfile && form.credit && form.smallBusiness && form.employees);
    return Boolean(form.region && form.purpose && form.needAmount);
  }, [form, step]);

  const update = (field: keyof FormData, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const goDiagnosis = () => document.getElementById("diagnosis")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (step < 3) { setStep(step + 1); return; }
    const next = scoreAgencies(form);
    setResults(next);
    setSelected(next[0].code);
    setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const industryLabel = labelOf(industryOptions, form.industry);
  const purposeLabel = labelOf([["operation", "운전자금"], ["facility", "시설자금"], ["development", "기술개발·사업화"], ["export", "수출 이행"], ["refinance", "상환구조 개선"]], form.purpose);
  const callOpening = `안녕하세요. ${form.region || "[지역]"}에서 ${industryLabel}을 운영하는 ${form.companyName || "[회사명]"} 대표입니다. ${purposeLabel}에 사용할 자금이 필요해서 ${selectedAgency.short} ${selectedAgency.type} 상담을 받고 싶어 전화드렸습니다.`;

  const qa = [
    ["사업자등록번호가 어떻게 되시죠?", "통화 첫 확인", "네, 저희 사업자등록번호는 [통화 전 확인]입니다."],
    ["어떤 사업을 하고 계신가요?", "업종과 영업 실체", `네, 저희는 ${form.region || "[지역]"}에서 ${industryLabel}을 하고 있습니다.`],
    ["자금은 어디에 쓰실 계획인가요?", "용도의 구체성", `네, ${purposeLabel}으로 사용할 계획이고 세부 견적과 지급 일정을 정리하고 있습니다.`],
    ["필요한 금액은 얼마인가요?", "산출 근거", `현재 필요한 금액은 ${money(form.needAmount)}이며, 계약·견적과 현금흐름을 기준으로 계산했습니다.`],
    ["대표님 경력이 어떻게 되시는지요?", "대표의 실행 역량", "네, 이 업종에서의 제 경력은 [기업 확인 필요]년이고, 주요 경험은 [기업 확인 필요]입니다."],
    ["직원은 몇 명인가요?", "규모와 실행 인력", `현재 상시근로자는 ${form.employees || "[기업 확인 필요]"}명입니다.`],
    ["작년 매출과 이익은 어느 정도인가요?", "상환 능력", `최근 연 매출은 ${money(form.annualRevenue)} 수준이고, 손익 변동 원인과 올해 계획도 함께 정리해 두었습니다.`],
    ["기존 대출과 보증은 얼마나 있나요?", "총부채와 중복 이용", `현재 대출·보증 잔액은 약 ${money(form.debtAmount)}이며 기관별 잔액표를 준비했습니다.`],
    ["연체나 세금 체납은 없으신가요?", "결격 사유", form.arrears === "clean" ? "네, 현재 금융 연체와 세금 체납은 없습니다." : "관련 사실이 있는 것은 맞습니다. 현재 상태와 해소 조치, 증빙 가능 시점을 정확히 정리해 말씀드리겠습니다."],
    [selectedAgency.code === "kibo" ? "핵심 기술이 무엇이고 무엇이 다른가요?" : selectedAgency.code === "ksure" ? "수출국과 바이어, 결제 조건은 어떻게 되나요?" : selectedAgency.code === "regional" ? "사업장 소재지와 신청 가능한 특례를 확인하셨나요?" : "이 자금으로 무엇이 개선되나요?", "기관별 핵심 심사", selectedAgency.callPoint],
    ["상환 재원은 무엇인가요?", "현실적인 상환 계획", "네, 기존 영업현금흐름을 기준으로 상환하고, 매출 회복이 늦어지는 보수 시나리오도 함께 검토했습니다."],
  ];

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="한국기업가치평가원 홈">
          <span className="brand-mark">K</span><span><b>한국기업가치평가원</b><small>Korea Enterprise Value Evaluation</small></span>
        </a>
        <nav aria-label="주요 메뉴"><a href="#process">진행 방식</a><a href="#institutions">기관 안내</a><a href="#safety">안전 기준</a></nav>
        <button className="header-cta" onClick={goDiagnosis}>무료 진단 시작</button>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span /> 대표가 주도하는 정책자금 신청</div>
            <h1>정책자금,<br /><em>대표가 직접</em><br />신청할 수 있습니다.</h1>
            <p>우리 회사의 준비 상태를 먼저 진단하고, 맞는 기관을 찾고, 실제 전화 상담과 서류 준비까지 한 단계씩 실행하세요.</p>
            <div className="hero-actions"><button className="primary" onClick={goDiagnosis}>3분 무료진단 시작 <span>→</span></button><a href="#process">진행 방식 보기</a></div>
            <div className="trust-row"><span>✓ 회원가입 없이 결과 확인</span><span>✓ 인증서·비밀번호 수집 없음</span><span>✓ 승인 약속 없는 정직한 진단</span></div>
          </div>
          <div className="hero-panel" aria-label="진단 결과 예시">
            <div className="panel-top"><span>POLICY FUND READINESS</span><span className="live-dot">진단 예시</span></div>
            <div className="score-hero"><div><small>신청 준비도</small><strong>72</strong><span>/ 100</span></div><span className="grade high">가능성 높음</span></div>
            <div className="mini-chart">
              {[["중진공", 72], ["신보", 68], ["기보", 57], ["지역신보", 46]].map(([name, score]) => <div className="mini-row" key={String(name)}><span>{name}</span><i><b style={{ width: `${score}%` }} /></i><strong>{score}</strong></div>)}
            </div>
            <div className="panel-note"><span>01</span><p><b>추천 기관</b>기업 상태에 맞는 1·2순위 기관을 안내합니다.</p></div>
            <div className="panel-note"><span>02</span><p><b>다음 행동</b>오늘 바로 실행할 준비 과제를 제시합니다.</p></div>
            <p className="fine">점수는 승인 확률이 아닌 신청 준비도 지표입니다.</p>
          </div>
        </div>
        <div className="hero-band"><span>공식 공고 확인</span><i>→</i><span>기업 자가진단</span><i>→</i><span>기관 선택</span><i>→</i><span>통화·서류 준비</span><i>→</i><span>대표 직접 신청</span></div>
      </section>

      <section className="intro section-pad">
        <div className="section-label">WHY IT MATTERS</div>
        <div className="intro-grid"><h2>맡기는 신청이 아니라,<br /><em>이해하고 통제하는 신청.</em></h2><div><p className="lead">정책자금의 주인은 기업입니다.</p><p>사업을 가장 잘 아는 사람도 대표이고, 자금이 필요한 이유와 상환 계획을 설명해야 할 사람도 대표입니다. 도움은 받을 수 있지만 사실 확인과 최종 제출은 기업이 지켜야 합니다.</p></div></div>
        <div className="problem-grid">
          {[['01','어느 기관이 맞는지 모른다','융자·보증·수출지원의 구조가 달라 처음부터 길을 잃기 쉽습니다.'],['02','우리 회사가 가능한지 모른다','업종·업력·재무·부채·신용을 함께 보지 않으면 판단이 흔들립니다.'],['03','기관 전화가 가장 어렵다','매출과 부채, 자금 용도를 묻는 질문에 준비 없이 답하면 신뢰를 잃습니다.']].map(([no,title,desc]) => <article key={no}><span>{no}</span><h3>{title}</h3><p>{desc}</p></article>)}
        </div>
      </section>

      <section className="process section-pad" id="process">
        <div className="section-heading"><div><div className="section-label light">HOW IT WORKS</div><h2>막연한 신청을<br />관리 가능한 프로젝트로.</h2></div><p>진단 결과에서 끝나지 않습니다. 대표가 실제 기관에 전화하고, 서류를 준비하고, 최종 제출할 수 있는 순서까지 연결합니다.</p></div>
        <div className="process-line">
          {[['01','3분 진단','핵심 5종 정보 확인'],['02','기관 분석','7개 기관 준비도 계산'],['03','실행 코칭','통화문·예상 질문 준비'],['04','30일 신청','서류부터 최종 제출까지']].map(([n,t,d]) => <div className="process-item" key={n}><span>{n}</span><i /><h3>{t}</h3><p>{d}</p></div>)}
        </div>
      </section>

      <section className="diagnosis-wrap section-pad" id="diagnosis">
        <div className="diagnosis-shell">
          <aside>
            <div className="section-label">3-MINUTE CHECK</div><h2>우리 회사<br />정책자금 준비도</h2><p>핵심 정보부터 차례로 확인합니다. 입력 내용은 이 페이지 안에서 결과 계산에만 사용됩니다.</p>
            <ol><li className={step >= 1 ? "active" : ""}><span>1</span>기본 자격</li><li className={step >= 2 ? "active" : ""}><span>2</span>재무·신용</li><li className={step >= 3 ? "active" : ""}><span>3</span>자금 계획</li></ol>
            <div className="security-note"><b>수집하지 않는 정보</b><span>주민번호 · 인증서 · 비밀번호 · 계좌정보</span></div>
          </aside>
          <form className="diagnosis-form" onSubmit={handleSubmit}>
            <div className="form-head"><div><span>STEP {step} / 3</span><h3>{step === 1 ? "먼저 기본 자격을 확인합니다" : step === 2 ? "재무와 준비 상태를 알려주세요" : "필요한 자금 계획을 정리합니다"}</h3></div><b>{progress}%</b></div>
            <div className="progress"><i style={{ width: `${progress}%` }} /></div>

            {step === 1 && <div className="form-fields">
              <Field label="1. 실제 매출이 발생하는 주업종" required><select value={form.industry} onChange={(e) => update("industry", e.target.value)}><option value="">선택해 주세요</option>{industryOptions.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
              <Field label="2. 업력" required><Choice value={form.ageBand} onChange={(v) => update("ageBand", v)} options={[["under1","1년 미만"],["oneToThree","1~3년"],["threeToFive","3~5년"],["over5","5년 이상"]]} /></Field>
              <div className="two-col"><Field label="3. 최근 연 매출" required><div className="input-unit"><input type="number" min="0" step="0.1" value={form.annualRevenue} onChange={(e) => update("annualRevenue", e.target.value)} placeholder="예: 12" /><span>억원</span></div></Field><Field label="4. 대출·보증 잔액" required><div className="input-unit"><input type="number" min="0" step="0.1" value={form.debtAmount} onChange={(e) => update("debtAmount", e.target.value)} placeholder="예: 3.5" /><span>억원</span></div></Field></div>
              <Field label="5. 현재 금융 연체 또는 국세·지방세 체납" required><Choice value={form.arrears} onChange={(v) => update("arrears", v)} options={[["clean","없음"],["past","과거 이력·현재 해소"],["recent","최근 해소"],["current","현재 진행 중"]]} /></Field>
            </div>}

            {step === 2 && <div className="form-fields">
              <Field label="최근 3개년 매출·이익 구조" required><select value={form.revenueProfile} onChange={(e) => update("revenueProfile", e.target.value)}><option value="">선택해 주세요</option><option value="best">매출 성장 + 영업이익 흑자</option><option value="good">매출 정체 + 흑자 유지</option><option value="medium">매출 성장 + 적자 또는 손익분기</option><option value="weak">매출 감소 + 적자</option><option value="none">매출 급감 또는 자본잠식 수준</option></select></Field>
              <Field label="부채비율·기존 보증 상태" required><select value={form.debtProfile} onChange={(e) => update("debtProfile", e.target.value)}><option value="">선택해 주세요</option><option value="best">부채비율 200% 미만 + 기존 보증 없음</option><option value="good">부채비율 200~400% 또는 기존 보증 소액</option><option value="medium">부채비율 400~700% 또는 보증한도 상당 소진</option><option value="none">부채비율 700% 초과 또는 한도 소진·과다차입</option><option value="unknown">정확히 모름</option></select></Field>
              <Field label="대표자 신용·업계 경력" required><select value={form.credit} onChange={(e) => update("credit", e.target.value)}><option value="">선택해 주세요</option><option value="best">신용 양호 + 동종업계 경력 충분</option><option value="good">신용 양호 + 업계 경력 짧음</option><option value="medium">신용 주의 또는 과거 폐업·회생 이력 해소</option><option value="none">신용불량 진행 중</option><option value="unknown">정확히 모름</option></select></Field>
              <div className="two-col"><Field label="소상공인 기준 충족 여부" required><select value={form.smallBusiness} onChange={(e) => update("smallBusiness", e.target.value)}><option value="">선택해 주세요</option><option value="yes">충족</option><option value="no">미충족</option><option value="unknown">기관 확인 필요</option></select></Field><Field label="상시근로자 수" required><div className="input-unit"><input type="number" min="0" value={form.employees} onChange={(e) => update("employees", e.target.value)} placeholder="예: 4" /><span>명</span></div></Field></div>
              <Field label="특허·연구소·벤처·이노비즈 등"><select value={form.technology} onChange={(e) => update("technology", e.target.value)}><option value="best">2개 이상 보유</option><option value="good">1개 보유</option><option value="medium">출원 중 또는 품질인증만 보유</option><option value="none">해당 없음</option><option value="unknown">확인 필요</option></select></Field>
            </div>}

            {step === 3 && <div className="form-fields">
              <div className="two-col"><Field label="사업장 소재 지역" required><input value={form.region} onChange={(e) => update("region", e.target.value)} placeholder="예: 경기도 성남시" /></Field><Field label="회사명 (선택)"><input value={form.companyName} onChange={(e) => update("companyName", e.target.value)} placeholder="예: 주식회사 가나다" /></Field></div>
              <Field label="수출 실적·계약 상태"><Choice value={form.exportStatus} onChange={(v) => update("exportStatus", v)} options={[["none","해당 없음"],["plan","계획 단계"],["contract","계약·LOI 보유"],["actual","수출 실적 보유"]]} /></Field>
              <Field label="자금의 주된 용도" required><Choice value={form.purpose} onChange={(v) => update("purpose", v)} options={[["operation","운전자금"],["facility","시설자금"],["development","기술개발"],["export","수출 이행"],["refinance","상환구조 개선"]]} /></Field>
              <Field label="필요 금액" required><div className="input-unit"><input type="number" min="0" step="0.1" value={form.needAmount} onChange={(e) => update("needAmount", e.target.value)} placeholder="견적·현금흐름 기준" /><span>억원</span></div></Field>
              <div className="form-disclaimer">입력 정보가 불명확한 항목은 중간값으로 잠정 반영되며, 실제 확인 결과에 따라 점수가 달라질 수 있습니다.</div>
            </div>}

            <div className="form-actions">{step > 1 && <button type="button" className="back" onClick={() => setStep(step - 1)}>← 이전</button>}<button className="primary form-next" disabled={!requiredDone}>{step < 3 ? "다음 단계" : "7개 기관 결과 확인"} <span>→</span></button></div>
          </form>
        </div>
      </section>

      {results && <section className="result-section section-pad" id="result">
        <div className="result-title"><div><div className="section-label light">YOUR RESULT</div><h2>{form.companyName || "귀사"}의 정책자금<br />준비도 결과입니다.</h2></div><p>점수는 승인 확률이 아닌 신청 준비도 지표입니다. 게이트 조건과 최신 공고는 신청 전에 기관에서 다시 확인해야 합니다.</p></div>
        {form.arrears === "current" && <div className="gate-alert"><b>현재 신청보다 연체·체납 해소가 우선입니다.</b><span>전 기관의 즉시 제한 가능성이 있으므로 납부·해소 증빙과 전산 반영 여부를 먼저 확인하세요.</span></div>}
        <div className="result-grid">
          <div className="rank-list">
            {results.map((agency, index) => <button key={agency.code} className={`rank-card ${selected === agency.code ? "selected" : ""}`} onClick={() => setSelected(agency.code)}><span className="rank">{String(index + 1).padStart(2,"0")}</span><div><b>{agency.short}</b><small>{agency.name}</small></div><div className="bar"><i style={{ width: `${agency.score}%` }} /></div><strong>{agency.score}</strong><em className={agency.grade === "가능성 높음" ? "high" : agency.grade === "조건부 가능" ? "conditional" : "low"}>{agency.grade}</em></button>)}
          </div>
          <article className="recommend-card">
            <div className="recommend-top"><span>{results.findIndex((item) => item.code === selected) + 1}순위 분석</span><em>{selectedAgency.type}</em></div>
            <h3>{selectedAgency.name}</h3><p className="focus">{selectedAgency.focus}</p>
            <div className="big-score"><strong>{(selectedAgency as Result).score}</strong><span>/ 100</span></div>
            <div className="recommend-copy"><b>이 기관이 보는 핵심</b><p>{selectedAgency.oneLine}에 적합합니다. {selectedAgency.callPoint}</p></div>
            <div className="next-action"><span>지금 할 일</span><b>{(selectedAgency as Result).gated ? "제한요소를 먼저 해소하고 재진단하세요." : "아래 통화 코칭으로 기관 상담을 준비하세요."}</b></div>
          </article>
        </div>

        <div className="coaching">
          <div className="coaching-head"><div><div className="section-label">CALL COACHING</div><h2>{selectedAgency.short}에 전화하기 전,<br />이 문장부터 준비하세요.</h2></div><span>대표가 그대로 읽어도 자연스러운 첫 마디</span></div>
          <div className="call-script"><span>30초 첫 마디</span><blockquote>“{callOpening}”</blockquote><button onClick={() => navigator.clipboard?.writeText(callOpening)}>문장 복사</button></div>
          <div className="call-rules"><h3>통화 화법 5원칙</h3><div>{["결론부터 짧게 답하기","매출·직원·부채 숫자 암기","모르면 확인 후 답변하기","불리한 사실은 원인·대책과 함께","부탁이 아닌 협의의 자세"].map((rule,i)=><p key={rule}><span>{i+1}</span>{rule}</p>)}</div></div>
          <div className="qa-wrap"><div className="qa-title"><h3>실제 통화 순서 예상 질문</h3><span>질문 의도와 답변 예시를 함께 확인하세요.</span></div>{qa.map(([question,intent,answer],index)=><details key={question} open={index === 0}><summary><span>{String(index+1).padStart(2,"0")}</span><b>{question}</b><em>{intent}</em></summary><div><small>대표 답변 예시</small><p>“{answer}”</p></div></details>)}</div>
          <div className="call-check"><div><span>통화 전에 챙길 것</span><b>사업자번호 · 최근 매출 · 직원 수 · 대출·보증 잔액 · 필요 금액</b></div><div><span>통화 후 확인할 것</span><b>다음 단계와 일정 · 준비서류 · 담당자 성함과 연락처</b></div></div>
        </div>
      </section>}

      <section className="institutions section-pad" id="institutions">
        <div className="section-heading dark"><div><div className="section-label">7 INSTITUTIONS</div><h2>같은 정책자금이 아닙니다.<br />기관마다 보는 것이 다릅니다.</h2></div><p>기관 이름만 보고 선택하지 마세요. 기업 규모, 기술, 수출, 지역, 재무 상태에 따라 출발점이 달라집니다.</p></div>
        <div className="agency-grid">{agencies.map((agency,i)=><article key={agency.code}><div><span>{String(i+1).padStart(2,"0")}</span><em>{agency.type}</em></div><h3>{agency.short}</h3><small>{agency.name}</small><p>{agency.oneLine}</p><b>{agency.focus}</b></article>)}</div>
      </section>

      <section className="roadmap section-pad">
        <div className="roadmap-head"><div className="section-label">30-DAY ROADMAP</div><h2>진단 다음에는<br />30일 직접 신청.</h2><p>공고 확인부터 최종 제출까지, 대표가 통제해야 할 일을 날짜별로 나눴습니다.</p></div>
        <div className="timeline">{[["1–3일","공고·변경공고 확인","공고번호와 대상 요건"],["4–7일","세금·금융·재무 진단","제한요소와 조치계획"],["8–12일","필요금액·상환계획","숫자 근거표"],["13–18일","사업계획서·증빙 연결","아홉 항목 초안"],["19–22일","기관 선택·공식 상담","질문과 답변 기록"],["23–28일","온라인 입력·면담 연습","첨부 시험·3분 설명"],["29–30일","교차검수·대표 제출","접수번호와 제출본"]].map(([day,title,done],i)=><article key={day}><span>{day}</span><i>{i+1}</i><div><h3>{title}</h3><p>완료 기준 · {done}</p></div></article>)}</div>
      </section>

      <section className="safety section-pad" id="safety">
        <div className="safety-copy"><div className="section-label light">SAFE APPLICATION</div><h2>대표가 직접 신청한다는 것은<br /><em>모든 일을 혼자 한다는 뜻이 아닙니다.</em></h2><p>전문가의 도움은 받을 수 있습니다. 다만 신청 사실과 숫자를 이해하고, 인증수단과 최종 제출을 기업이 직접 통제해야 합니다.</p></div>
        <div className="safety-grid"><article className="do"><span>해야 할 일</span>{["공식 공고와 변경공고 확인","제출 숫자와 증빙 일치","대표가 신청서 전체 검토","불리한 사실도 대책과 함께 설명"].map(x=><p key={x}>✓ {x}</p>)}</article><article className="dont"><span>하지 말아야 할 일</span>{["승인 약속을 대가로 비용 지급","인맥·청탁을 내세운 접근","매출·대출·기술자료 부풀리기","인증서·인감·로그인정보 외부 전달"].map(x=><p key={x}>× {x}</p>)}</article></div>
      </section>

      <section className="faq section-pad"><div className="section-label">FAQ</div><h2>대표들이 가장 많이 묻는 질문</h2><div className="faq-list">{[
        ["진단 점수가 실제 승인 확률인가요?","아닙니다. 이 점수는 신청 준비도 지표입니다. 최종 승인 여부는 해당 기관의 공고와 심사 결과에 따릅니다."],
        ["적자 기업은 신청할 수 없나요?","적자만으로 일괄 판단할 수는 없습니다. 적자의 원인, 회복 근거, 현금흐름과 상환계획을 함께 확인해야 합니다."],
        ["신용보증기금과 기술보증기금은 무엇이 다른가요?","두 기관 모두 보증기관이지만 신보는 재무와 신용·사업성을, 기보는 기술성과 사업화 가능성을 상대적으로 더 중시합니다."],
        ["전문가의 도움을 받으면 문제가 되나요?","정상적인 정보 제공과 자문은 가능합니다. 다만 허위서류, 기관 사칭, 승인 약속, 부당한 결합 영업은 피해야 하며 최종 제출은 기업이 통제해야 합니다."],
        ["현재 체납이 있으면 어떻게 해야 하나요?","신청보다 체납 해소와 증빙 발급, 전산 반영 여부 확인이 우선입니다. 해소 후 최신 공고 기준으로 재진단하세요."],
      ].map(([q,a])=><details key={q}><summary>{q}<span>＋</span></summary><p>{a}</p></details>)}</div></section>

      <section className="final-cta section-pad"><div><span>POLICY FUND SELF-APPLICATION</span><h2>정책자금 신청의 출발점은<br />한도 조회가 아니라 <em>우리 회사 진단</em>입니다.</h2><p>3분이면 지금 신청할지, 무엇을 보완할지, 어느 기관부터 확인할지 알 수 있습니다.</p><button className="primary light-btn" onClick={goDiagnosis}>무료 진단 다시 시작 <span>→</span></button></div></section>

      <footer><div className="footer-brand"><span className="brand-mark">K</span><div><b>주식회사 한국기업가치평가원</b><small>Korea Enterprise Value Evaluation Co., Ltd.</small></div></div><p>대표 김성민 · 대표번호 1844-0285</p><p className="disclaimer">본 진단은 내부 판단 참고용 사전 진단이며, 최종 승인은 해당 기관의 심사 결과에 따릅니다. 금리·한도·요건은 신청 시점에 해당 기관의 최신 공고로 재확인해야 합니다.</p><small>© 2026 Korea Enterprise Value Evaluation Co., Ltd. All rights reserved.</small></footer>
    </main>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <label className="field"><span>{label}{required && <em>필수</em>}</span>{children}</label>;
}

function Choice({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[][] }) {
  return <div className="choices">{options.map(([key,label]) => <button type="button" className={value === key ? "chosen" : ""} aria-pressed={value === key} key={key} onClick={() => onChange(key)}>{label}</button>)}</div>;
}
