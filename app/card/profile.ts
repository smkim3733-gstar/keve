// 모바일 명함 공통 정보 (업무지침 7.2 회사 공식 정보 기준)
export const profile = {
  name: "김성민",
  familyName: "김",
  givenName: "성민",
  title: "대표",
  company: "주식회사 한국기업가치평가원",
  companyShort: "한국기업가치평가원",
  companyEn: "Korea Enterprise Value Evaluation Co., Ltd.",
  slogan: "대한민국 중소기업 가치 성장의 전문 파트너",
  phone: "1844-0285",
  phoneHref: "tel:18440285",
  email: "smkim3733@naver.com",
  website: "www.keve.co.kr",
  websiteHref: "https://www.keve.co.kr",
  address: "서울시 강남구 테헤란로 143, 4층(역삼동, 고운빌딩)",
  street: "테헤란로 143, 4층(역삼동, 고운빌딩)",
  locality: "강남구",
  region: "서울특별시",
  postalCode: "",
  mapHref: "https://map.naver.com/p/search/" + encodeURIComponent("서울 강남구 테헤란로 143"),
  bizNumber: "206-87-03912",
};

export const services = [
  { title: "정책자금 컨설팅", desc: "중진공·소진공·신보·기보·지역신보 기관별 전략 설계" },
  { title: "기업인증", desc: "벤처·이노비즈·메인비즈·기업부설연구소·ISO" },
  { title: "특허 출원·등록", desc: "특허 가능성 진단부터 출원·등록까지" },
  { title: "기업가치평가", desc: "특허 가치평가·기업가치 산정 및 설득 논리 설계" },
  { title: "CEO 자산관리", desc: "자금조달·가업승계 대비·부동산 프로젝트" },
  { title: "기업컨설팅 창업과정", desc: "기업영업 전문 컨설턴트 양성 교육" },
];

export const books = [
  "기업컨설턴트 상담의 기술 1·2권",
  "연구소·벤처·이노비즈·메인비즈 CEO 상담에서 계약까지",
  "정책자금 컨설턴트의 길",
  "중소기업 CEO 365일",
];

// vCard 3.0 값 이스케이프 (쉼표·세미콜론·역슬래시)
const esc = (value: string) => value.replace(/[\\;,]/g, (c) => `\\${c}`);

export function buildVCard() {
  const p = profile;
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N;CHARSET=UTF-8:${p.familyName};${p.givenName};;;`,
    `FN;CHARSET=UTF-8:${p.name}`,
    `ORG;CHARSET=UTF-8:${p.company}`,
    `TITLE;CHARSET=UTF-8:${p.title}`,
    `TEL;TYPE=WORK,VOICE:${p.phone}`,
    `EMAIL;TYPE=WORK,INTERNET:${p.email}`,
    `URL:${p.websiteHref}`,
    `ADR;TYPE=WORK;CHARSET=UTF-8:;;${esc(p.street)};${p.locality};${p.region};${p.postalCode};대한민국`,
    `NOTE;CHARSET=UTF-8:${esc(p.slogan)} | 정책자금·기업인증·특허·기업가치평가·CEO 자산관리`,
    "END:VCARD",
  ];
  return lines.join("\r\n") + "\r\n";
}
