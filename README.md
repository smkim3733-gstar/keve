# KEVE 정책자금 자가신청 랜딩페이지

주식회사 한국기업가치평가원의 정책자금 사전진단·자가신청 안내 사이트입니다.

대표가 기업 현황을 직접 입력하면 7개 정책금융기관별 신청 준비도를 확인하고,
우선 상담 기관·전화 코칭·30일 신청 절차를 안내받을 수 있습니다.

## 주요 기능

- 3단계 정책자금 사전진단
- 7개 기관별 준비도 점수 및 우선순위
- 기관 전화상담 코칭과 예상 질문
- 정책자금 직접 신청 30일 로드맵
- 데스크톱·태블릿·모바일 반응형 화면

## 실행 방법

Node.js 22.13 이상이 필요합니다.

```bash
npm install
npm run dev
```

배포용 Next.js 빌드는 다음 명령으로 확인합니다.

```bash
npm run build
```

## Vercel 배포

GitHub 저장소를 Vercel 프로젝트로 가져온 뒤 아래 설정을 사용합니다.

- Framework Preset: `Next.js`
- Root Directory: `.`
- Build Command: `npm run build`
- Output Directory: 비워 두기

기존 Vercel 프로젝트를 사용한다면 설정을 저장한 후 최신 커밋으로 다시 배포합니다.

## 사이트

[정책자금 자가신청 페이지](https://policy-fund-self-apply.smkim3733.chatgpt.site)

© 2026 Korea Enterprise Value Evaluation Co., Ltd.
