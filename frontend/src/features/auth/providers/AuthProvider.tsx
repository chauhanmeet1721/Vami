"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import type { AuthUser, MeData } from "@/features/auth/types";
import { ApiError, refreshAccessToken, tokenStore } from "@/platform/api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  activeSessionId: string | null;
  setSession: (accessToken: string, user: AuthUser, activeSessionId?: string) => void;
  clearSession: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const ME_QUERY_KEY = ["auth", "me"] as const;

async function bootstrapMe(): Promise<MeData | null> {
  if (!tokenStore.get()) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) return null;
  }

  try {
    return await authApi.me();
  } catch (error) {
    if (error instanceof ApiError && (error.isUnauthorized || error.isForbidden)) {
      tokenStore.clear();
      return null;
    }
    throw error;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: bootstrapMe,
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: true,
  });

  const setSession = useCallback(
    (accessToken: string, nextUser: AuthUser, sessionId?: string) => {
      tokenStore.set(accessToken);
      const next: MeData = {
        user: nextUser,
        activeSessionId: sessionId ?? "",
      };
      queryClient.setQueryData(ME_QUERY_KEY, next);
    },
    [queryClient],
  );

  const clearSession = useCallback(() => {
    tokenStore.clear();
    queryClient.setQueryData(ME_QUERY_KEY, null);
    queryClient.removeQueries({ queryKey: ["auth"] });
  }, [queryClient]);

  const refreshProfile = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
  }, [queryClient]);

  const user = meQuery.data?.user ?? null;
  const activeSessionId = meQuery.data?.activeSessionId ?? null;

  const status: AuthStatus = meQuery.isLoading
    ? "loading"
    : user
      ? "authenticated"
      : "unauthenticated";

  const value = useMemo(
    () => ({
      status,
      user,
      activeSessionId,
      setSession,
      clearSession,
      refreshProfile,
    }),
    [status, user, activeSessionId, setSession, clearSession, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
