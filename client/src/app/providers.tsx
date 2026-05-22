"use client";

import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { showToast } from "@/components/Toast";
import ToastContainer from "@/components/Toast";

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { data?: { error?: string } } };
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
  }
  if (error instanceof Error) {
    if (error.message === "Network Error") {
      return "Network error. Please check your connection and try again.";
    }
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
        mutationCache: new MutationCache({
          onError: (error) => {
            showToast(getErrorMessage(error), "error");
          },
        }),
        queryCache: new QueryCache({
          onError: (error) => {
            const queryError = error as unknown as { response?: { status?: number } };
            if (queryError?.response?.status !== 401) {
              showToast(getErrorMessage(error), "error");
            }
          },
        }),
      })
  );

  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
    };
    window.addEventListener("unhandledrejection", handleRejection);
    return () => window.removeEventListener("unhandledrejection", handleRejection);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <ToastContainer />
      </AuthProvider>
    </QueryClientProvider>
  );
}
