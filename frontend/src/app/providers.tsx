"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AppThemeProvider } from "@/platform/theme";
import { AuthProvider } from "@/features/auth";

type ProvidersProps = {
  children: React.ReactNode;
};

/** App-wide client providers — order: theme → query → auth. */
export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
            retry: 1,
          },
        },
      }),
  );

  return (
    <AppThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </AppThemeProvider>
  );
}
