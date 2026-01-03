// SearchInput.tsx - Fixed to use controlled input properly
"use client";
import { useState, useCallback, useEffect } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: SearchInputProps) {
  // Debounce the onChange call
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, 300);
    return () => clearTimeout(timeout);
  }, [value, onChange]);

  return (
    <input
      type="text"
      defaultValue={value}
      onBlur={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full max-w-md px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${className}`}
    />
  );
}
