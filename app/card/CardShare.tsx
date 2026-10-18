"use client";

import { useState } from "react";

export default function CardShare({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: title, url });
        return;
      } catch {
        // 사용자가 공유를 취소한 경우 링크 복사로 넘어가지 않는다
        return;
      }
    }
    await copy();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("명함 링크를 복사하세요", url);
    }
  };

  return (
    <div className="bc-share">
      <button type="button" className="bc-btn bc-btn-gold" onClick={share}>명함 공유하기</button>
      <button type="button" className="bc-btn bc-btn-line" onClick={copy}>{copied ? "복사되었습니다" : "링크 복사"}</button>
    </div>
  );
}
