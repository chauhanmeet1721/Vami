import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';

export const SESSIONS_QUERY_KEY = ['auth', 'sessions'];

export function useSessionsQuery() {
  return useQuery({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: async () => {
      const res = await authApi.getSessions();
      return res.data || [];
    },
  });
}
