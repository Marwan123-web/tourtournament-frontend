"use client";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  message,
  className = "",
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
    xl: "h-16 w-16 border-4",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-3 p-8 ${className}`}
    >
      <div
        className={`animate-spin rounded-full border-gray-200 border-t-indigo-600 ${
          sizeClasses[size as keyof typeof sizeClasses]
        }`}
      />
      {message && (
        <p className="text-sm text-gray-500 animate-pulse">{message}</p>
      )}
    </div>
  );
}
