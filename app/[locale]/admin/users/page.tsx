"use client";
import { useState, useEffect } from "react";
import type { User } from "@/types/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { DataTable } from "@/components/DataTable";
import { CreateEditModal } from "@/components/CreateEditModal";
import { ActionButtons } from "@/components/ActionButtons";
import { SearchInput } from "@/components/SearchInput";
import { StatusBadge } from "@/components/StatusBadge";
import { FormInput } from "@/components/FormInput";
import { Modal } from "@/components/Modal";
import { adminApi, getErrorMessage } from "@/lib/api";
import { useTranslations } from "next-intl";

export default function AdminUsers() {
  const t = useTranslations("adminUsers"); // Assuming translation namespace

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    email: "",
    username: "",
    name: "",
    surname: "",
    role: "user" as User["role"],
  });

  const [confirmSuspendUser, setConfirmSuspendUser] = useState<User | null>(
    null
  );

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await adminApi.getUsers(search?.toLowerCase());
      setUsers(data);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      email: user.email ?? "",
      username: user.username ?? "",
      name: user.name ?? "",
      surname: user.surname ?? "",
      role: (user.role as User["role"]) ?? "user",
    });
    setError("");
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUpdating(true);
    setError("");

    try {
      const updated = await adminApi.updateUser(editingUser.id, {
        email: editForm.email,
        username: editForm.username,
        name: editForm.name,
        surname: editForm.surname,
        role: editForm.role,
      });

      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setEditingUser(null);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleActive = async (user: User, nextIsActive: boolean) => {
    setUpdating(true);
    setError("");

    try {
      const updated = await adminApi.updateUser(user.id, {
        isActive: nextIsActive,
      });

      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setUpdating(false);
    }
  };

  const handleSuspendUser = async () => {
    if (!confirmSuspendUser) return;
    await handleToggleActive(confirmSuspendUser, false);
    setConfirmSuspendUser(null);
  };

  const columns = [
    {
      key: "id" as keyof User,
      label: t("columns.id"),
      render: (user: User) => `#${user.id}`,
    },
    {
      key: "name" as keyof User,
      label: t("columns.name"),
      render: (user: User) => (
        <span className="font-medium">
          {`${user.name || "-"} ${user.surname || ""}`.trim() || "-"}
        </span>
      ),
    },
    {
      key: "email" as keyof User,
      label: t("columns.email"),
    },
    {
      key: "username" as keyof User,
      label: t("columns.username"),
      render: (user: User) => user.username || "-",
    },
    {
      key: "role" as keyof User,
      label: t("columns.role"),
      render: (user: User) => <StatusBadge status={user.role || "user"} />,
    },
    {
      key: "tournamentsCreated" as keyof User,
      label: t("columns.tournaments"),
      render: () => "5", // Static value from original
    },
  ];

  const userActions = (user: User) => (
    <ActionButtons
      onEdit={() => openEdit(user)}
      onDelete={user.isActive ? () => setConfirmSuspendUser(user) : undefined}
      onActivate={
        !user.isActive ? () => handleToggleActive(user, true) : undefined
      }
      updating={updating}
    />
  );

  if (loading) {
    return <LoadingSpinner size="xl" message={t("loading")} />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-900">{t("title")}</h1>
      </div>

      <ErrorBanner error={error} onClear={() => setError('')} />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder={t("searchPlaceholder")}
      />

      <DataTable
        data={users} // Now only server-filtered data
        columns={columns}
        actions={userActions}
      />

      {editingUser && (
        <CreateEditModal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={`${t("editModal.title")} #${editingUser.id}`}
          onSubmit={handleUpdateUser}
          updating={updating}
        >
          <div className="grid grid-cols-2 gap-4 mb-4">
            <FormInput
              label={t("editModal.name")}
              id="name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, name: e.target.value }))
              }
              disabled={updating}
            />
            <FormInput
              label={t("editModal.surname")}
              id="surname"
              value={editForm.surname}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, surname: e.target.value }))
              }
              disabled={updating}
            />
          </div>

          <FormInput
            label={t("editModal.email")}
            id="email"
            type="email"
            value={editForm.email}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, email: e.target.value }))
            }
            required
            disabled={updating}
          />

          <FormInput
            label={t("editModal.username")}
            id="username"
            value={editForm.username}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, username: e.target.value }))
            }
            disabled={updating}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("editModal.role")}
            </label>
            <select
              value={editForm.role}
              onChange={(e) =>
                setEditForm((f) => ({
                  ...f,
                  role: e.target.value as User["role"],
                }))
              }
              disabled={updating}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            >
              <option value="user">{t("roles.user")}</option>
              <option value="admin">{t("roles.admin")}</option>
            </select>
          </div>
        </CreateEditModal>
      )}

      {confirmSuspendUser && (
        <Modal
          isOpen={!!confirmSuspendUser}
          onClose={() => setConfirmSuspendUser(null)}
          title={t("suspendModal.title")}
          maxWidth="sm"
        >
          <div className="text-center">
            <p className="text-sm text-gray-700 mb-6">
              {t("suspendModal.message", {
                user:
                  confirmSuspendUser.email ||
                  confirmSuspendUser.username ||
                  t("user"),
              })}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmSuspendUser(null)}
                disabled={updating}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleSuspendUser}
                disabled={updating}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {updating ? t("suspending") : t("confirm")}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
