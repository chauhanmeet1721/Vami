import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthDispatch } from '../providers/AuthProvider';

export function useLogoutMutation() {
  const dispatch = useAuthDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      // Regardless of API success or failure, we clear local auth state
      // to ensure the user is logged out locally.
      dispatch({ type: 'LOGOUT' });
      
      // Clear all react-query cache on logout to prevent data leaking
      queryClient.clear();
    },
  });
}
