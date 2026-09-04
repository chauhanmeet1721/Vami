import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthDispatch } from '../providers/AuthProvider';
import { RegisterPayload } from '../types';

export function useRegisterMutation() {
  const dispatch = useAuthDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (res) => {
      // Only auto-login when tokens were issued (email verification may block sessions)
      if (res.data?.accessToken && res.data.user) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: res.data.user,
            accessToken: res.data.accessToken,
            activeSessionId: res.data.session?._id,
          },
        });
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
    onError: () => {
      // Handled via component form state and Sonner toasts
    }
  });
}
