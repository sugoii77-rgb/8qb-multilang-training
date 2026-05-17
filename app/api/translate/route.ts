import { NextResponse } from "next/server";

type TranslateRequestBody = {
  text?: unknown;
  target?: unknown;
};

type LibreTranslateResponse = {
  translatedText?: string;
  error?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

const fallbackEndpoints = [
  "https://libretranslate.com/translate",
  "https://translate.argosopentech.com/translate"
];

const languageNames: Record<string, string> = {
  ko: "Korean",
  en: "English",
  vi: "Vietnamese",
  bn: "Bengali",
  uz: "Uzbek",
  ky: "Kyrgyz",
  ur: "Urdu",
  ne: "Nepali",
  zh: "Simplified Chinese"
};

function makeError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getTranslateEndpoints() {
  const envUrl = process.env.LIBRETRANSLATE_URL?.trim();

  if (!envUrl) {
    return fallbackEndpoints;
  }

  const normalizedUrl = envUrl.endsWith("/") ? envUrl.slice(0, -1) : envUrl;
  return [`${normalizedUrl}/translate`, ...fallbackEndpoints];
}

function extractGeminiText(data: GeminiResponse) {
  return (
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim() ?? ""
  );
}

async function translateWithGemini(text: string, target: string) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  const model = process.env.GEMINI_TRANSLATE_MODEL?.trim() || "gemini-1.5-flash";
  const targetLanguage = languageNames[target] ?? target;

  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: [
                "You are a professional manufacturing training translator.",
                "Translate accurately for factory operators.",
                "Keep quality, safety, and manufacturing terms clear.",
                "Return only the translated text. Do not add explanations.",
                "",
                `Target language: ${targetLanguage}`,
                "",
                "Text:",
                text
              ].join("\n")
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1
      }
    }),
    cache: "no-store"
  });

  const data = (await response.json().catch(() => ({}))) as GeminiResponse;

  if (!response.ok) {
    const message = data.error?.message ?? `HTTP ${response.status}`;
    throw new Error(`Gemini API 오류: ${message}`);
  }

  const translatedText = extractGeminiText(data);

  if (!translatedText) {
    throw new Error("Gemini API 번역 결과가 비어 있습니다.");
  }

  return translatedText;
}

async function translateWithLibre(text: string, target: string) {
  const endpoints = getTranslateEndpoints();
  const errors: string[] = [];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          q: text,
          source: "auto",
          target,
          format: "text"
        }),
        cache: "no-store"
      });

      const data = (await response.json().catch(() => ({}))) as LibreTranslateResponse;

      if (!response.ok) {
        const serverMessage = data.error ? ` (${data.error})` : "";
        errors.push(`${endpoint}: HTTP ${response.status}${serverMessage}`);
        continue;
      }

      if (!data.translatedText) {
        errors.push(`${endpoint}: 번역 결과가 비어 있습니다.`);
        continue;
      }

      return data.translatedText;
    } catch (error) {
      const message = error instanceof Error ? error.message : "알 수 없는 오류";
      errors.push(`${endpoint}: ${message}`);
    }
  }

  throw new Error(
    [
      "무료 LibreTranslate 서버에서 번역을 완료하지 못했습니다.",
      "공개 서버가 일시적으로 차단되었거나, 선택한 언어를 지원하지 않을 수 있습니다.",
      `상세 정보: ${errors.join(" | ")}`
    ].join(" ")
  );
}

export async function POST(request: Request) {
  let body: TranslateRequestBody;

  try {
    body = (await request.json()) as TranslateRequestBody;
  } catch {
    return makeError("요청 형식이 올바르지 않습니다.", 400);
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const target = typeof body.target === "string" ? body.target.trim() : "";

  if (!text) {
    return makeError("번역할 문장이 비어 있습니다.", 400);
  }

  if (!target) {
    return makeError("번역 대상 언어가 선택되지 않았습니다.", 400);
  }

  try {
    const geminiResult = await translateWithGemini(text, target);

    if (geminiResult) {
      return NextResponse.json({
        translatedText: geminiResult,
        provider: "gemini"
      });
    }

    const libreResult = await translateWithLibre(text, target);

    return NextResponse.json({
      translatedText: libreResult,
      provider: "libretranslate"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 번역 오류가 발생했습니다.";

    return makeError(
      [
        "번역을 완료하지 못했습니다.",
        "Gemini API Key, API 활성화 상태, 사용량 한도 또는 네트워크를 확인하십시오.",
        message
      ].join(" "),
      502
    );
  }
}
