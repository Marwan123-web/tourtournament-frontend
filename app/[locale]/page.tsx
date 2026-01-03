import Link from "next/link";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <div className="max-w-4xl mx-auto text-center py-20">
      <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
        {t("title")}
      </h1>
      <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
        {t("description")}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/tournaments"
          className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
        >
          {t("cta.browse")}
        </Link>
        <Link
          href="/fields"
          className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-600 hover:text-white transition-all"
        >
          {t("cta.bookField")}
        </Link>
      </div>
    </div>
  );
}
