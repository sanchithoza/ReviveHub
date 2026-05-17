"use client";

import { useEffect, useRef } from "react";
import { Check, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger";
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  children,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      confirmButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const confirmButtonClass = confirmVariant === "danger" ? "btn btn-danger" : "btn btn-primary";

  return (
    <div
      className="modal-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <h3 className="mb-1" id="modal-title">{title}</h3>
        <p className="mb-2 text-muted">{message}</p>
        {children}
        <div className="flex gap-1" style={{ justifyContent: "flex-end" }}>
          <button className="btn" onClick={onCancel}><X size={16} /> {cancelLabel}</button>
          <button ref={confirmButtonRef} className={confirmButtonClass} onClick={onConfirm}><Check size={16} /> {confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
