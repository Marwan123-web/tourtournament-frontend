"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  searchKeys = [],
  className = "",
}: DataTableProps<T>) {
  const t = useTranslations("common");
  const [search, setSearch] = useState("");

  const filteredData = data.filter((item) =>
    searchKeys.some((key) =>
      String(item[key] || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  );

  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${className}`}
    >
      {searchKeys.length > 0 && (
        <div className="mb-8">
          <input
            type="text"
            placeholder={t("search.placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {col.render ? col.render(item) : String(item[col.key])}
                  </td>
                ))}
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  {t("noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
