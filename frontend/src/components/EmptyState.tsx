/** Empty state placeholder shown when a list has no results. */
import { PackageOpen } from "lucide-react";

interface Props {
  title?: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({
  title = "Nothing here yet",
  message = "No items to display.",
  action,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
        <PackageOpen className="w-10 h-10 text-indigo-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-gray-500 max-w-xs mb-6">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
