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
      if (res.data) {
        dispatch({
          type: 'LOGIN_SUCCESS', // Registration acts as a login if successful
          payload: {
            user: res.data.user,
            accessToken: res.data.accessToken,
            activeSessionId: res.data.session?._id,
          },
        });

        // Invalidate relevant queries upon registration
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
    onError: () => {
      // Handled via component form state and Sonner toasts
    }
  });
}
