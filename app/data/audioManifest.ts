export const AUDIO_LANGS = ["ko", "en", "vi", "bn", "uz", "ru", "ur", "ne", "zh", "id"] as const;
export const AUDIO_ITEMS = 8;
export const AUDIO_SEGMENTS = [
  "main", "why", "example", "check",
  "quiz_question", "quiz_a", "quiz_b", "quiz_c", "quiz_d",
] as const;

export type AudioSegment = (typeof AUDIO_SEGMENTS)[number];

export function getAudioPath(lang: string, audioId: string): string {
  return `/audio/${lang}/${audioId}.mp3`;
}

/**
 * Full manifest of all 720 audio file paths.
 * Key: "{lang}/{audioId}"  Value: "/audio/{lang}/{audioId}.mp3"
 */
export const audioManifest: Record<string, string> = Object.fromEntries(
  AUDIO_LANGS.flatMap((lang) =>
    Array.from({ length: AUDIO_ITEMS }, (_, i) =>
      AUDIO_SEGMENTS.map((seg) => {
        const audioId = `q${i + 1}_${seg}`;
        return [`${lang}/${audioId}`, `/audio/${lang}/${audioId}.mp3`];
      })
    ).flat()
  )
);
