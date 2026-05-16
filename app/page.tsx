"use client";

import Link from "next/link";

const QBItems = [
  "표준작업을 반드시 준수하십시오.",
  "이상이 발생하면 즉시 작업을 멈추고 갭리더에게 보고하십시오.",
  "불량품과 의심품은 정상품과 섞이지 않도록 격리하십시오.",
  "작업자, 설비, 자재, 작업방법이 변경되면 반드시 확인하십시오.",
  "검사 기준과 검사 위치를 정확히 확인하십시오.",
  "제품 라벨, 박스 라벨, 식별표를 반드시 확인하십시오.",
  "작업장 정리정돈을 유지하여 혼입과 누락을 방지하십시오.",
  "안전이 가장 중요합니다. 위험하면 즉시 작업을 중지하십시오.",
];

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-md p-8 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          8QB 다국어 음성 번역 시스템
        </h1>
        <p className="text-lg text-gray-500 text-center mb-8">
          외국인 작업자 교육용 · GAP Leader / Supervisor용
        </p>
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            8QB 핵심 교육 항목
          </h2>
          <ol className="space-y-3">
            {QBItems.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 bg-gray-50 rounded-xl p-4"
              >
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {idx + 1}
                </span>
                <span className="text-gray-700 text-lg leading-snug">{item}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="text-center">
          <Link href="/training">
            <button className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-2xl font-bold py-5 px-12 rounded-2xl shadow-lg transition-colors w-full sm:w-auto">
              🌐 8QB Training 시작
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
