/**
 * Global app state managed with React Context + useReducer.
 * Keeps things simple and readable without a full state library.
 * Stores: notifications (toast alerts), a simple global loading flag.
 */

import { createContext, useContext, useReducer, type ReactNode } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface AppState {
  toasts: Toast[];
}

type AppAction =
  | { type: "SHOW_TOAST"; payload: Omit<Toast, "id"> }
  | { type: "DISMISS_TOAST"; payload: string };

// ─── Reducer ────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SHOW_TOAST":
      return {
        ...state,
        toasts: [
          ...state.toasts,
          { ...action.payload, id: crypto.randomUUID() },
        ],
      };
    case "DISMISS_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };
    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  toast: (message: string, type?: ToastType) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, { toasts: [] });

  function toast(message: string, type: ToastType = "info") {
    const id = crypto.randomUUID();
    dispatch({ type: "SHOW_TOAST", payload: { message, type } });
    // Auto-dismiss after 4 seconds
    setTimeout(() => dispatch({ type: "DISMISS_TOAST", payload: id }), 4000);
  }

  function dismissToast(id: string) {
    dispatch({ type: "DISMISS_TOAST", payload: id });
  }

  return (
    <AppContext.Provider value={{ state, toast, dismissToast }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

