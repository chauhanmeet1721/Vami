import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthDispatch } from '../providers/AuthProvider';
import { LoginCredentials } from '../types';

export function useLoginMutation() {
  const dispatch = useAuthDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (res) => {
      if (res.data) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: res.data.user,
            accessToken: res.data.accessToken,
            activeSessionId: res.data.session?._id,
          },
        });
        
        // Invalidate relevant queries upon login
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
    onError: () => {
      // Handled via component form state and Sonner toasts
    }
  });
}
