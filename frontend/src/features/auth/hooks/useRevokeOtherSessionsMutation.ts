import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { SESSIONS_QUERY_KEY } from './useSessionsQuery';
import { ApiError } from '@/core/api-client';

export function useRevokeOtherSessionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.revokeOtherSessions(),
    onSuccess: () => {
      // Invalidate the sessions list to trigger a refetch
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
    },
    onError: (error: ApiError) => {
      console.error('[useRevokeOtherSessionsMutation] Failed to revoke other sessions:', error.message);
    }
  });
}
