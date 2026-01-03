"use client";
import { useTransition } from "react";
import { useTranslations } from "next-intl";

interface ErrorBannerProps {
  error: string | null;
  className?: string;
}

export function ErrorBanner({ error, className = "" }: ErrorBannerProps) {
  const t = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  if (!error) return null;

  startTransition(() => {
    // Clear error after 5s
    setTimeout(() => {}, 5000);
  });

  return (
    <div
      className={`mb-6 p-4 bg-red-50 border border-red-200 rounded-md ${className}`}
    >
      <p className="text-sm text-red-800">{error || t("error.default")}</p>
    </div>
  );
}
