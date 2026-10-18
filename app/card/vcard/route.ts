import { buildVCard } from "../profile";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildVCard(), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="kim-sungmin.vcf"; filename*=UTF-8''${encodeURIComponent("김성민_한국기업가치평가원.vcf")}`,
    },
  });
}
