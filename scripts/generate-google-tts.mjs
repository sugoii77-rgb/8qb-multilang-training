import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const API_KEY = process.env.GOOGLE_TTS_API_KEY;
if (!API_KEY) { console.error('Set GOOGLE_TTS_API_KEY'); process.exit(1); }
const LANG_VOICE = {
  ko: { languageCode: 'ko-KR', name: 'ko-KR-Standard-A', gender: 'FEMALE' },
  en: { languageCode: 'en-US', name: 'en-US-Standard-C', gender: 'FEMALE' },
  vi: { languageCode: 'vi-VN', name: 'vi-VN-Standard-A', gender: 'FEMALE' },
  bn: { languageCode: 'bn-IN', name: 'bn-IN-Standard-A', gender: 'FEMALE' },
  uz: { languageCode: 'ru-RU', name: 'ru-RU-Standard-A', gender: 'FEMALE' },
  ru: { languageCode: 'ru-RU', name: 'ru-RU-Standard-A', gender: 'FEMALE' },
  ur: { languageCode: 'hi-IN', name: 'hi-IN-Standard-A', gender: 'FEMALE' },
  ne: { languageCode: 'hi-IN', name: 'hi-IN-Standard-D', gender: 'FEMALE' },
  zh: { languageCode: 'cmn-CN', name: 'cmn-CN-Standard-A', gender: 'FEMALE' },
  id: { languageCode: 'id-ID', name: 'id-ID-Standard-A', gender: 'FEMALE' },
};
const tsSource = readFileSync(join(ROOT, 'app/data/audioScript.ts'), 'utf8');
const objMatch = tsSource.match(/export\s+const\s+audioScript[^=]*=\s*(\{[\s\S]+\})\s*;?\s*$/);
if (!objMatch) throw new Error('Cannot find audioScript in audioScript.ts');
const audioScript = eval('(' + objMatch[1] + ')');
const FORCE = process.argv.includes('--force');
const outputDir = join(ROOT, 'public', 'audio');
const langs = Object.keys(audioScript);
const FIELDS = ['main','why','example','check','quiz_question','quiz_a','quiz_b','quiz_c','quiz_d'];
const total = langs.reduce((s,l) => s + audioScript[l].length * FIELDS.length, 0);
console.log(`Starting TTS generation: ${total} files total`);
console.log(`Force overwrite: ${FORCE}`);
function ttsRequest(text, voice) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ input:{text}, voice:{languageCode:voice.languageCode,name:voice.name,ssmlGender:voice.gender}, audioConfig:{audioEncoding:'MP3'} });
    const req = https.request({ hostname:'texttospeech.googleapis.com', path:`/v1/text:synthesize?key=${API_KEY}`, method:'POST', headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)} }, res => {
      let data=''; res.on('data',c=>data+=c); res.on('end',()=>{ const r=JSON.parse(data); if(r.error) reject(new Error(`TTS API ${r.error.code}: ${JSON.stringify(r.error)}`)); else resolve(Buffer.from(r.audioContent,'base64')); });
    });
    req.on('error',reject); req.write(body); req.end();
  });
}
let generated=0,skipped=0,errors=0;
async function main() {
  for (const lang of langs) {
    const voice=LANG_VOICE[lang];
    if (!voice) { console.log(`SKIP ${lang}`); continue; }
    mkdirSync(join(outputDir,lang),{recursive:true});
    for (let i=0;i<audioScript[lang].length;i++) {
      const item=audioScript[lang][i]; const qid=`q${i+1}`;
      for (const field of FIELDS) {
        const file=`${lang}/${qid}_${field}.mp3`; const p=join(outputDir,lang,`${qid}_${field}.mp3`);
        if (!FORCE && existsSync(p)) { skipped++; continue; }
        try { const buf=await ttsRequest(item[field],voice); writeFileSync(p,buf); console.log(`OK   ${file}`); generated++; }
        catch(e) { console.log(`FAIL ${file} - ${e.message}`); errors++; }
      }
    }
  }
  console.log(`\nGenerated : ${generated}\nSkipped   : ${skipped}\nErrors    : ${errors}\nTotal     : ${generated+skipped+errors} / ${total}`);
}
main().catch(e=>{console.error(e);process.exit(1);});