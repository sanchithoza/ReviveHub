"use client";

import { useAuth } from "@/context/AuthContext";

export default function ViewOnlyNotice() {
  const { viewOnlyErrorMessage, clearViewOnlyError } = useAuth();

  if (!viewOnlyErrorMessage) {
    return null;
  }

  return (
    <div className="view-only-overlay" onClick={clearViewOnlyError}>
      <div className="view-only-popup" onClick={(event) => event.stopPropagation()}>
        <h3>Action Blocked</h3>
        <p>{viewOnlyErrorMessage}</p>
        <button type="button" className="btn btn-primary" onClick={clearViewOnlyError}>
          OK
        </button>
      </div>
    </div>
  );
}
