import { NextRequest, NextResponse } from 'next/server';

const AZURE_KEY = process.env.AZURE_TRANSLATOR_KEY!;
const AZURE_REGION = process.env.AZURE_TRANSLATOR_REGION || 'koreacentral';
const langMap: Record<string, string> = {
  ko:'ko', en:'en', vi:'vi', bn:'bn', uz:'uz',
  ru:'ru', ur:'ur', ne:'ne', zh:'zh-Hans', id:'id',
};

export async function POST(request: NextRequest) {
  try {
    const { text, from, to } = await request.json();
    const res = await fetch(
      `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${langMap[from]||from}&to=${langMap[to]||to}`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_KEY,
          'Ocp-Apim-Subscription-Region': AZURE_REGION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ text }]),
      }
    );
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
    return NextResponse.json({ translatedText: data[0]?.translations[0]?.text || '' });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}