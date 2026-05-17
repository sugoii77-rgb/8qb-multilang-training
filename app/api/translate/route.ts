import { NextRequest, NextResponse } from "next/server";

const AZURE_KEY = process.env.AZURE_TRANSLATOR_KEY;
const AZURE_REGION = process.env.AZURE_TRANSLATOR_REGION || "koreacentral";

const langMap: Record<string, string> = {
  ko: "ko",
  korean: "ko",
  "한국어": "ko",
  "한국어 korean": "ko",

  en: "en",
  english: "en",
  "영어": "en",
  "영어 english": "en",

  vi: "vi",
  vietnamese: "vi",
  "베트남어": "vi",
  "베트남어 vietnamese": "vi",

  bn: "bn",
  bangla: "bn",
  bengali: "bn",
  "벵골어": "bn",

  uz: "uz",
  uzbek: "uz",
  "o‘zbek": "uz",
  "우즈베크어": "uz",

  ru: "ru",
  russian: "ru",
  "러시아어": "ru",

  ur: "ur",
  urdu: "ur",
  "우르두어": "ur",

  ne: "ne",
  nepali: "ne",
  "네팔어": "ne",

  zh: "zh-Hans",
  chinese: "zh-Hans",
  "中文": "zh-Hans",
  "중국어": "zh-Hans",

  id: "id",
  indonesian: "id",
  "bahasa indonesia": "id",
  "인도네시아어": "id",
};

function normalizeLang(value: unknown): string {
  if (typeof value !== "string") return "";
  const raw = value.trim();
  const lower = raw.toLowerCase();

  return langMap[raw] || langMap[lower] || raw;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const text = String(body.text ?? "").trim();
    const targetRaw = body.to ?? body.target ?? body.targetLanguage ?? body.language;
    const target = normalizeLang(targetRaw);

    if (!text) {
      return NextResponse.json(
        { translatedText: "", error: "No text provided." },
        { status: 400 }
      );
    }

    if (!AZURE_KEY) {
      return NextResponse.json(
        { translatedText: "", error: "Azure key not configured." },
        { status: 500 }
      );
    }

    if (!target) {
      return NextResponse.json(
        {
          translatedText: "",
          error: `Target language is missing or invalid: ${String(targetRaw)}`,
        },
        { status: 400 }
      );
    }

    const url =
      `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${encodeURIComponent(target)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_KEY,
        "Ocp-Apim-Subscription-Region": AZURE_REGION,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify([{ Text: text }]),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          translatedText: "",
          error: Array.isArray(data)
            ? data[0]?.message || JSON.stringify(data)
            : data?.error?.message || JSON.stringify(data),
          debug: {
            targetRaw,
            target,
          },
        },
        { status: res.status }
      );
    }

    const translatedText = data?.[0]?.translations?.[0]?.text ?? "";

    return NextResponse.json({
      translatedText,
      detectedLanguage: data?.[0]?.detectedLanguage,
      target,
    });
  } catch (error) {
    return NextResponse.json(
      {
        translatedText: "",
        error: error instanceof Error ? error.message : "Unknown translation error",
      },
      { status: 500 }
    );
  }
}