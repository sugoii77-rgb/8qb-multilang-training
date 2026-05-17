import { NextResponse } from "next/server";
import { createRequire } from "module";

export const runtime = "nodejs";

type PdfParseResult = {
  text?: string;
};

type PdfParseFunction = (buffer: Buffer) => Promise<PdfParseResult>;

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as PdfParseFunction;

function makeError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return makeError("FormData 요청을 읽을 수 없습니다.", 400);
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return makeError("PDF 파일이 첨부되지 않았습니다.", 400);
  }

  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    return makeError("PDF 파일만 업로드할 수 있습니다.", 400);
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return makeError("PDF 파일이 비어 있습니다.", 400);
    }

    const parsed = await pdfParse(buffer);
    const text = parsed.text?.trim() ?? "";

    if (!text) {
      return makeError(
        "PDF에서 텍스트를 추출하지 못했습니다. 스캔 이미지 PDF일 가능성이 있습니다. OCR은 이 앱에서 지원하지 않습니다.",
        422
      );
    }

    return NextResponse.json({ text });
  } catch {
    return makeError(
      "PDF 텍스트 추출 중 오류가 발생했습니다. 암호화된 PDF, 손상된 PDF, 또는 스캔 이미지 PDF일 수 있습니다.",
      500
    );
  }
}
