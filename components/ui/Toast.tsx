"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastAction = { label: string; onPress: () => void };
type ToastState = { message: string; action?: ToastAction } | null;

const ToastContext = createContext<{
  showToast: (message: string, action?: ToastAction) => void;
}>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((message: string, action?: ToastAction) => {
    setToast({ message, action });
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 2200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        role="status"
        className={`pointer-events-none fixed left-1/2 top-[calc(env(safe-area-inset-top)+60px)] z-50 flex w-max max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-3 rounded-[22px] bg-[#1f1a1c] px-[15px] py-2.5 text-[11px] font-[650] text-white transition-all duration-200 ${
          visible && toast
            ? "translate-y-0 opacity-100"
            : "-translate-y-3.5 opacity-0"
        }`}
      >
        {toast ? (
          <>
            <span>{toast.message}</span>
            {toast.action ? (
              <button
                className="pointer-events-auto -my-3 -mr-2 grid min-h-11 min-w-11 place-items-center border-0 bg-transparent px-2 text-[11px] font-extrabold text-butter"
                onClick={() => {
                  toast.action?.onPress();
                  setVisible(false);
                }}
              >
                {toast.action.label}
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}
