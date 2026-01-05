"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

interface ErrorBannerProps {
  error: string | null;
  onClear?: () => void;  // Parent clears: setError(null)
  className?: string;
}

export function ErrorBanner({ error, onClear, className = "" }: ErrorBannerProps) {
  const t = useTranslations("common");
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (error) {
      timeoutRef.current = setTimeout(() => {
        onClear?.();
      }, 5000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [error, onClear]);

  if (!error) return null;

  return (
    <div className={`mb-6 p-4 bg-red-50 border border-red-200 rounded-md ${className}`}>
      <p className="text-sm text-red-800">{error}</p>
    </div>
  );
}
