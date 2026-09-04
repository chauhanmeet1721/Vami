import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });
}
