interface ActionButtonsProps {
  onEdit: () => void;
  onDelete?: () => void;
  onActivate?: () => void;
  updating: boolean;
}

export function ActionButtons({
  onEdit,
  onDelete,
  onActivate,
  updating,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2 justify-end">
      <button
        onClick={onEdit}
        disabled={updating}
        className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 text-sm"
      >
        Edit
      </button>
      {onDelete && (
        <button
          onClick={onDelete}
          disabled={updating}
          className="text-red-600 hover:text-red-900 disabled:opacity-50 text-sm"
        >
          Delete
        </button>
      )}
      {onActivate && (
        <button
          onClick={onActivate}
          disabled={updating}
          className="text-green-600 hover:text-green-900 disabled:opacity-50 text-sm"
        >
          Activate
        </button>
      )}
    </div>
  );
}
