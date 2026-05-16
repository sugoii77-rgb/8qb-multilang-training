"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const LANGUAGES = [
  { label: "한국어", value: "ko", speech: "ko-KR" },
  { label: "English", value: "en", speech: "en-US" },
  { label: "Tiếng Việt (베트남어)", value: "vi", speech: "vi-VN" },
  { label: "বাংলা (방글라데시어)", value: "bn", speech: "bn-BD" },
  { label: "Oʻzbekcha (우즈베크어)", value: "uz", speech: "uz-UZ" },
  { label: "Кыргызча (키르기스어)", value: "ky", speech: "ky-KG" },
  { label: "اردو (우르두어)", value: "ur", speech: "ur-PK" },
  { label: "नेपाली (네팔어)", value: "ne", speech: "ne-NP" },
  { label: "中文 (중국어)", value: "zh", speech: "zh-CN" },
];

const QB_SENTENCES = [
  "표준작업을 반드시 준수하십시오.",
  "이상이 발생하면 즉시 작업을 멈추고 갭리더에게 보고하십시오.",
  "불량품과 의심품은 정상품과 섞이지 않도록 격리하십시오.",
  "작업자, 설비, 자재, 작업방법이 변경되면 반드시 확인하십시오.",
  "검사 기준과 검사 위치를 정확히 확인하십시오.",
  "제품 라벨, 박스 라벨, 식별표를 반드시 확인하십시오.",
  "작업장 정리정돈을 유지하여 혼입과 누락을 방지하십시오.",
  "안전이 가장 중요합니다. 위험하면 즉시 작업을 중지하십시오.",
];

export default function TrainingPage() {
  const [selectedLang, setSelectedLang] = useState("en");
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentLang = LANGUAGES.find((l) => l.value === selectedLang)!;

  const handleQBClick = (sentence: string) => {
    setInputText(sentence);
    setTranslatedText("");
    setErrorMsg("");
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setErrorMsg("번역할 문장을 입력하거나 8QB 항목을 선택하세요.");
      return;
    }
    setIsTranslating(true);
    setErrorMsg("");
    setTranslatedText("");
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText.trim(), target: selectedLang }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || "번역에 실패했습니다.");
      } else {
        setTranslatedText(data.translatedText || "");
      }
    } catch {
      setErrorMsg("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = () => {
    if (!translatedText.trim()) {
      setErrorMsg("먼저 번역을 실행하세요.");
      return;
    }
    setErrorMsg("");
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = currentLang.speech;
    utterance.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const matched = voices.find(
      (v) => v.lang === currentLang.speech || v.lang.startsWith(currentLang.value)
    );
    if (matched) utterance.voice = matched;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg("");
    setInputText("PDF에서 텍스트 추출 중...");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || "PDF 처리에 실패했습니다.");
        setInputText("");
      } else {
        setInputText(data.text || "");
      }
    } catch {
      setErrorMsg("PDF 업로드 중 오류가 발생했습니다.");
      setInputText("");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/">
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-xl text-lg transition-colors">
            ← 뒤로
          </button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">8QB 다국어 교육 번역</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-5 mb-5">
        <label className="block text-lg font-bold text-gray-700 mb-2">🌐 번역 언어 선택</label>
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="w-full border-2 border-gray-300 rounded-xl p-3 text-xl font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-5 mb-5">
        <p className="text-lg font-bold text-gray-700 mb-3">
          📋 8QB 항목 선택 (클릭하면 입력창에 들어갑니다)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QB_SENTENCES.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleQBClick(s)}
              className="bg-gray-50 hover:bg-blue-50 active:bg-blue-100 border-2 border-gray-200 hover:border-blue-400 text-gray-700 text-left rounded-xl p-4 text-base font-medium transition-colors leading-snug"
            >
              <span className="inline-block bg-blue-600 text-white rounded-full w-7 h-7 text-center font-bold mr-2 text-sm leading-7">
                {idx + 1}
              </span>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-5 mb-5">
        <label className="block text-lg font-bold text-gray-700 mb-2">✏️ 번역할 문장 입력</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="번역할 문장을 직접 입력하거나 위 버튼을 클릭하세요."
          rows={4}
          className="w-full border-2 border-gray-300 rounded-xl p-3 text-lg text-gray-800 focus:outline-none focus:border-blue-500 resize-none"
        />
        <div className="mt-3">
          <label className="block text-base font-semibold text-gray-600 mb-1">📄 PDF 업로드 (텍스트형 PDF)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handlePdfUpload}
            className="block w-full text-base text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-100 file:text-blue-700 file:font-semibold hover:file:bg-blue-200 cursor-pointer"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-5">
        <button
          onClick={handleTranslate}
          disabled={isTranslating}
          className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 text-white text-xl font-bold py-5 rounded-2xl shadow transition-colors"
        >
          {isTranslating ? "번역 중..." : "🔄 번역"}
        </button>
        <button
          onClick={handleSpeak}
          disabled={isSpeaking || !translatedText}
          className="flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-green-300 text-white text-xl font-bold py-5 rounded-2xl shadow transition-colors"
        >
          🔊 음성 출력
        </button>
        <button
          onClick={handleStop}
          className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xl font-bold py-5 rounded-2xl shadow transition-colors"
        >
          ⏹ 음성 중지
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border-2 border-red-300 text-red-700 rounded-xl p-4 mb-5 text-lg font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md p-5">
        <label className="block text-lg font-bold text-gray-700 mb-2">
          🌏 번역 결과 ({currentLang.label})
        </label>
        <textarea
          value={translatedText}
          readOnly
          placeholder="번역 결과가 여기에 표시됩니다."
          rows={5}
          className="w-full border-2 border-gray-200 rounded-xl p-3 text-xl text-gray-800 bg-gray-50 resize-none"
        />
      </div>
    </div>
  );
}
