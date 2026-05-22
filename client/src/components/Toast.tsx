"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export interface ToastMessage {
  id: number;
  text: string;
  type: "error" | "success" | "info";
}

let nextId = 1;
let activeToasts: ToastMessage[] = [];
let updateToastUI: ((toasts: ToastMessage[]) => void) | null = null;

export function showToast(text: string, type: "error" | "success" | "info" = "error"): void {
  const toastMessage: ToastMessage = { id: nextId, text, type };
  nextId += 1;
  activeToasts = [...activeToasts, toastMessage];
  if (updateToastUI) {
    updateToastUI(activeToasts);
  }
  setTimeout(() => {
    activeToasts = activeToasts.filter((activeToast) => activeToast.id !== toastMessage.id);
    if (updateToastUI) {
      updateToastUI(activeToasts);
    }
  }, 5000);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    updateToastUI = setToasts;
    return () => {
      updateToastUI = null;
    };
  }, []);

  const removeToast = (id: number) => {
    activeToasts = activeToasts.filter((activeToast) => activeToast.id !== id);
    setToasts(activeToasts);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toastMessage) => (
        <div key={toastMessage.id} className={`toast toast-${toastMessage.type}`}>
          <span>{toastMessage.text}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => removeToast(toastMessage.id)}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
