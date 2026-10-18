import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import QRCode from "qrcode";
import CardShare from "./CardShare";
import { books, profile, services } from "./profile";
import "./card.css";

async function cardUrl() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return { origin: `${protocol}://${host}`, url: `${protocol}://${host}/card` };
}

export async function generateMetadata(): Promise<Metadata> {
  const { origin, url } = await cardUrl();
  const title = `${profile.name} ${profile.title} | ${profile.companyShort}`;
  const description = `${profile.slogan} · 정책자금 · 기업인증 · 특허 · 기업가치평가 · CEO 자산관리 · 대표번호 ${profile.phone}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, type: "profile", url, images: [{ url: `${origin}/og.png`, width: 1536, height: 1024, alt: profile.company }] },
    twitter: { card: "summary_large_image", title, description, images: [`${origin}/og.png`] },
  };
}

export const viewport: Viewport = { themeColor: "#10243d", width: "device-width", initialScale: 1 };

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg>
);

const icons = {
  phone: "M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z",
  mail: "M4 5h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2zm8 7.2L20 7H4zm0 2.1L4 9.2V17h16V9.2z",
  web: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-3a15.6 15.6 0 0 0-1.4-3.6A8 8 0 0 1 18.9 8zM12 4a14 14 0 0 1 1.9 4h-3.8A14 14 0 0 1 12 4zM4.3 14a8.2 8.2 0 0 1 0-4h3.4a16.5 16.5 0 0 0 0 4zm.8 2h3a15.6 15.6 0 0 0 1.4 3.6A8 8 0 0 1 5.1 16zm3-8h-3a8 8 0 0 1 4.4-3.6A15.6 15.6 0 0 0 8.1 8zM12 20a14 14 0 0 1-1.9-4h3.8A14 14 0 0 1 12 20zm2.3-6H9.7a14.7 14.7 0 0 1 0-4h4.6a14.7 14.7 0 0 1 0 4zm.2 5.6a15.6 15.6 0 0 0 1.4-3.6h3a8 8 0 0 1-4.4 3.6zm1.8-5.6a16.5 16.5 0 0 0 0-4h3.4a8.2 8.2 0 0 1 0 4z",
  map: "M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z",
  save: "M15 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2zm9 4c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z",
};

export default async function BusinessCardPage() {
  const { url } = await cardUrl();
  const qrSvg = await QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#10243d", light: "#ffffff" } });
  const p = profile;

  const quick = [
    { label: "전화", href: p.phoneHref, icon: icons.phone },
    { label: "이메일", href: `mailto:${p.email}`, icon: icons.mail },
    { label: "홈페이지", href: p.websiteHref, icon: icons.web, external: true },
    { label: "오시는 길", href: p.mapHref, icon: icons.map, external: true },
  ];

  return (
    <main className="bc-page">
      <article className="bc-card">
        <section className="bc-hero">
          <div className="bc-logo"><img src="/keve-logo.jpg" alt={`${p.companyShort} Korea Enterprise Value Evaluation`} /></div>
          <div className="bc-identity">
            <p className="bc-role">{p.companyShort} · {p.title}</p>
            <h1>{p.name}</h1>
            <p className="bc-en">Kim Sungmin · CEO</p>
          </div>
          <p className="bc-slogan">{p.slogan}</p>
          <dl className="bc-stats">
            <div><dt>기업컨설팅</dt><dd>13<small>년+</small></dd></div>
            <div><dt>컨설턴트 양성</dt><dd>350<small>여 명</small></dd></div>
            <div><dt>저서</dt><dd>5<small>권</small></dd></div>
          </dl>
        </section>

        <nav className="bc-quick" aria-label="빠른 연락">
          {quick.map((item) => (
            <a key={item.label} href={item.href} {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              <span><Icon d={item.icon} /></span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="bc-save-wrap">
          <a className="bc-btn bc-btn-navy" href="/card/vcard" download>
            <Icon d={icons.save} /> 연락처 저장하기
          </a>
        </div>

        <section className="bc-section">
          <h2><span>01</span> 주요 업무</h2>
          <ul className="bc-services">
            {services.map((s) => (
              <li key={s.title}><b>{s.title}</b><span>{s.desc}</span></li>
            ))}
          </ul>
        </section>

        <section className="bc-section">
          <h2><span>02</span> 대표 소개</h2>
          <p className="bc-bio">2013년부터 중소기업 CEO 대상 법인 컨설팅·자금조달·기업인증 업무를 수행하고, 약 350명의 기업컨설턴트를 교육했습니다. 기업의 가치를 높이고 성장시키는 실행 중심 솔루션을 제공합니다.</p>
          <ul className="bc-books">
            {books.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </section>

        <section className="bc-section">
          <h2><span>03</span> 연락처</h2>
          <dl className="bc-info">
            <div><dt>대표번호</dt><dd><a href={p.phoneHref}>{p.phone}</a></dd></div>
            <div><dt>이메일</dt><dd><a href={`mailto:${p.email}`}>{p.email}</a></dd></div>
            <div><dt>홈페이지</dt><dd><a href={p.websiteHref} target="_blank" rel="noopener noreferrer">{p.website}</a></dd></div>
            <div><dt>주소</dt><dd><a href={p.mapHref} target="_blank" rel="noopener noreferrer">{p.address}</a></dd></div>
            <div><dt>사업자번호</dt><dd>{p.bizNumber}</dd></div>
          </dl>
        </section>

        <section className="bc-section bc-qr-section">
          <div className="bc-qr" dangerouslySetInnerHTML={{ __html: qrSvg }} role="img" aria-label="모바일 명함 QR 코드" />
          <div>
            <h2 className="bc-qr-title">QR로 명함 전달</h2>
            <p>상대방 휴대폰 카메라로 스캔하면 이 명함이 바로 열립니다.</p>
          </div>
        </section>

        <div className="bc-section bc-share-wrap">
          <CardShare url={url} title={`${p.name} ${p.title} | ${p.company}`} />
        </div>

        <footer className="bc-footer">
          <p>{p.company}<br />{p.companyEn}</p>
          <small>본 컨설팅은 신청 지원 업무이며, 최종 승인은 해당 기관의 심사 결과에 따릅니다.</small>
        </footer>
      </article>
    </main>
  );
}
