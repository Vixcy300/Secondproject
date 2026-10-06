/**
 * Toast notification container.
 * Renders toasts from AppContext in the bottom-right corner.
 */
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useApp } from "../context/AppContext";

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const colors = {
  success: "border-green-200 bg-green-50",
  error: "border-red-200 bg-red-50",
  warning: "border-amber-200 bg-amber-50",
  info: "border-blue-200 bg-blue-50",
};

export default function ToastContainer() {
  const { state, dismissToast } = useApp();

  if (state.toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {state.toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg 
            animate-slide-up ${colors[toast.type]}`}
        >
          {icons[toast.type]}
          <p className="flex-1 text-sm text-gray-800">{toast.message}</p>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-gray-400 hover:text-gray-700 transition-colors mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
