export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "FormData 파싱에 실패했습니다." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "PDF 파일이 없습니다." }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdfParse(buffer);
    const text = data.text?.trim();
    if (!text) {
      return NextResponse.json(
        { error: "텍스트를 추출하지 못했습니다. 스캔 이미지 PDF는 지원되지 않습니다." },
        { status: 422 }
      );
    }
    return NextResponse.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    return NextResponse.json({ error: `PDF 처리 중 오류: ${message}` }, { status: 500 });
  }
}
