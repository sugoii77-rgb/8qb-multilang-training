import { NextRequest, NextResponse } from "next/server";

// MyMemory free API: no key needed, 10,000 words/day, reliable on Vercel
async function tryMyMemory(text: string, target: string): Promise<string | null> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ko|${target}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.responseStatus === 200 && data?.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    return null;
  } catch {
    return null;
  }
}

// LibreTranslate fallback endpoints
const LIBRE_ENDPOINTS = [
  process.env.LIBRETRANSLATE_URL
    ? `${process.env.LIBRETRANSLATE_URL}/translate`
    : null,
  "https://translate.argosopentech.com/translate",
  "https://libretranslate.com/translate",
].filter(Boolean) as string[];

async function tryLibre(text: string, target: string): Promise<string | null> {
  for (const endpoint of LIBRE_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text, source: "auto", target, format: "text" }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data?.translatedText) return data.translatedText;
    } catch {
      continue;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  let body: { text?: string; target?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const { text, target } = body;

  if (!text || !target) {
    return NextResponse.json(
      { error: "text와 target 값이 필요합니다." },
      { status: 400 }
    );
  }

  // 1차: MyMemory (가장 안정적)
  const myMemoryResult = await tryMyMemory(text, target);
  if (myMemoryResult) {
    return NextResponse.json({ translatedText: myMemoryResult });
  }

  // 2차: LibreTranslate 폴백
  const libreResult = await tryLibre(text, target);
  if (libreResult) {
    return NextResponse.json({ translatedText: libreResult });
  }

  return NextResponse.json(
    {
      error: "번역 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
    },
    { status: 503 }
  );
}
