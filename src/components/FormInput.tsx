"use client";
import { useTranslations } from "next-intl";

interface FormInputProps {
  label: string;
  id: string;
  type?: string;
  value: string | number;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  required?: boolean;
  disabled?: boolean;
}

export function FormInput({
  label,
  id,
  type = "text",
  value,
  onChange,
  required = false,
  disabled = false,
}: FormInputProps) {
  const t = useTranslations("form");

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
      />
    </div>
  );
}
