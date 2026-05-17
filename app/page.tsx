import Link from "next/link";

type LanguageCard = {
  code: string;
  nativeName: string;
  koreanName: string;
  description: string;
};

const languageCards: LanguageCard[] = [
  {
    code: "ko",
    nativeName: "한국어",
    koreanName: "한국어",
    description: "기본 한국어 교육"
  },
  {
    code: "en",
    nativeName: "English",
    koreanName: "영어",
    description: "English training"
  },
  {
    code: "vi",
    nativeName: "Tiếng Việt",
    koreanName: "베트남어",
    description: "Đào tạo tiếng Việt"
  },
  {
    code: "bn",
    nativeName: "বাংলা",
    koreanName: "벵골어",
    description: "বাংলা প্রশিক্ষণ"
  },
  {
    code: "uz",
    nativeName: "Oʻzbek",
    koreanName: "우즈베크어",
    description: "Oʻzbekcha taʼlim"
  },
  {
    code: "ru",
    nativeName: "Русский",
    koreanName: "러시아어",
    description: "Русское обучение"
  },
  {
    code: "ur",
    nativeName: "اردو",
    koreanName: "우르두어",
    description: "اردو تربیت"
  },
  {
    code: "ne",
    nativeName: "नेपाली",
    koreanName: "네팔어",
    description: "नेपाली तालिम"
  },
  {
    code: "zh",
    nativeName: "中文",
    koreanName: "중국어",
    description: "中文培训"
  },
  {
    code: "id",
    nativeName: "Bahasa Indonesia",
    koreanName: "인도네시아어",
    description: "Pelatihan bahasa Indonesia"
  }
];

const eightQbItems = [
  "표준작업 준수",
  "이상 발생 시 즉시 정지 및 보고",
  "불량품 · 의심품 격리",
  "4M 변경 시 확인",
  "검사 기준 · 검사 위치 확인",
  "라벨 · 박스 라벨 · 식별표 확인",
  "정리정돈으로 혼입 · 누락 방지",
  "안전 최우선"
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow-lg sm:p-8">
        <div className="text-center">
          <p className="mb-2 text-lg font-extrabold text-blue-700">
            Faurecia Yeongcheon Plant
          </p>

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            8QB 다국어 음성 번역 시스템
          </h1>

          <p className="mt-4 text-xl font-semibold text-gray-700">
            외국인 작업자 교육을 위한 현장용 번역 · 음성 출력 웹앱
          </p>
        </div>

        <section className="mt-10 rounded-3xl border border-blue-100 bg-blue-50 p-6">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-extrabold text-gray-900">
              교육 언어를 선택하십시오
            </h2>
            <p className="mt-2 text-base font-bold text-gray-700">
              Select your training language
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {languageCards.map((language) => (
              <Link
                key={language.code}
                href={`/training?lang=${language.code}`}
                className={`rounded-2xl border p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                  language.code === "ko"
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 bg-white text-gray-900"
                }`}
              >
                <h3 className="text-2xl font-extrabold">
                  {language.nativeName}
                </h3>
                <p
                  className={`mt-2 text-base font-extrabold ${
                    language.code === "ko" ? "text-white" : "text-blue-700"
                  }`}
                >
                  {language.koreanName}
                </p>
                <p
                  className={`mt-2 text-sm font-semibold ${
                    language.code === "ko" ? "text-blue-50" : "text-gray-600"
                  }`}
                >
                  {language.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-2xl font-extrabold text-gray-900">
            8QB 기본 항목
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {eightQbItems.map((item, index) => (
              <article
                key={item}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm"
              >
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl font-extrabold text-blue-700">
                  {index + 1}
                </div>
                <h3 className="text-xl font-extrabold leading-7 text-gray-900">
                  {item}
                </h3>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-10 text-center text-base font-semibold text-gray-500">
          © OH Young-Hwan
        </footer>
      </section>
    </main>
  );
}

