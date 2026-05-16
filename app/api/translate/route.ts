import { NextRequest, NextResponse } from "next/server";

const LIBRE_ENDPOINTS = [
  process.env.LIBRETRANSLATE_URL
    ? `${process.env.LIBRETRANSLATE_URL}/translate`
    : null,
  "https://libretranslate.com/translate",
  "https://translate.argosopentech.com/translate",
].filter(Boolean) as string[];

export async function POST(req: NextRequest) {
  let body: { text?: string; target?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const { text, target } = body;
  if (!text || !target) {
    return NextResponse.json({ error: "text와 target 값이 필요합니다." }, { status: 400 });
  }

  let lastError = "";
  for (const endpoint of LIBRE_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text, source: "auto", target, format: "text" }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        lastError = `서버 오류 (${res.status})`;
        continue;
      }
      const data = await res.json();
      if (data?.translatedText) {
        return NextResponse.json({ translatedText: data.translatedText });
      }
      lastError = "번역 결과를 받지 못했습니다.";
    } catch (err) {
      lastError = err instanceof Error ? err.message : "알 수 없는 오류";
    }
  }

  return NextResponse.json(
    { error: `번역 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.\n마지막 오류: ${lastError}` },
    { status: 503 }
  );
}
